use serde::Deserialize;
use swc_core::ecma::{
    ast::*,
    visit::{VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use std::collections::HashMap;

/// Plugin configuration options
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginConfig {
    /// Runtime function name (default: "__i18n_lookup")
    #[serde(default = "default_runtime_function")]
    pub runtime_function: String,
}

fn default_runtime_function() -> String {
    "__i18n_lookup".to_string()
}

/// Supported translation function names
const IT_FUNCTION_NAMES: &[&str] = &[
    "it",
    "it_ja", "it_zh", "it_es", "it_fr", "it_de",
    "en_ja", "en_zh", "en_es", "en_fr", "en_de",
    "ja_zh", "ja_es", "zh_es",
];

/// Language pair mapping for shorthand syntax
fn get_pair_mapping(func_name: &str) -> (&'static str, &'static str) {
    match func_name {
        "it" => ("ko", "en"),
        "it_ja" => ("ko", "ja"),
        "it_zh" => ("ko", "zh"),
        "it_es" => ("ko", "es"),
        "it_fr" => ("ko", "fr"),
        "it_de" => ("ko", "de"),
        "en_ja" => ("en", "ja"),
        "en_zh" => ("en", "zh"),
        "en_es" => ("en", "es"),
        "en_fr" => ("en", "fr"),
        "en_de" => ("en", "de"),
        "ja_zh" => ("ja", "zh"),
        "ja_es" => ("ja", "es"),
        "zh_es" => ("zh", "es"),
        _ => ("ko", "en"),
    }
}

/// Generate a simple hash from content using djb2 algorithm
fn generate_hash(content: &str) -> String {
    let mut hash: u32 = 5381;

    for byte in content.bytes() {
        hash = hash.wrapping_mul(33) ^ (byte as u32);
    }

    // Convert to base36 and take first 8 characters
    let hash_str = format!("{:x}", hash);
    hash_str.chars().take(8).collect()
}

/// Convert Atom to String
fn atom_to_string(atom: &swc_core::atoms::Atom) -> String {
    atom.as_str().to_string()
}

/// Convert Wtf8Atom to String
fn wtf8_atom_to_string(atom: &swc_core::atoms::Wtf8Atom) -> String {
    atom.as_str().unwrap_or("").to_string()
}

pub struct TransformVisitor {
    config: PluginConfig,
}

impl TransformVisitor {
    pub fn new(config: PluginConfig) -> Self {
        Self { config }
    }

    /// Extract string value from a Lit node
    fn get_string_value(&self, expr: &Expr) -> Option<String> {
        match expr {
            Expr::Lit(Lit::Str(s)) => Some(wtf8_atom_to_string(&s.value)),
            _ => None,
        }
    }

    /// Extract translations from object expression
    fn extract_object_translations(&self, obj: &ObjectLit) -> Option<HashMap<String, String>> {
        let mut translations = HashMap::new();

        for prop in &obj.props {
            if let PropOrSpread::Prop(prop) = prop {
                if let Prop::KeyValue(kv) = prop.as_ref() {
                    let key = match &kv.key {
                        PropName::Ident(ident) => atom_to_string(&ident.sym),
                        PropName::Str(s) => wtf8_atom_to_string(&s.value),
                        _ => continue,
                    };

                    if let Some(value) = self.get_string_value(&kv.value) {
                        translations.insert(key, value);
                    }
                }
            }
        }

        if translations.is_empty() {
            None
        } else {
            Some(translations)
        }
    }

    /// Build an object literal from translations map
    fn build_object_lit(&self, translations: &HashMap<String, String>) -> ObjectLit {
        let props: Vec<PropOrSpread> = translations
            .iter()
            .map(|(key, value)| {
                PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                    key: PropName::Ident(IdentName::new(key.clone().into(), Default::default())),
                    value: Box::new(Expr::Lit(Lit::Str(Str {
                        span: Default::default(),
                        value: value.clone().into(),
                        raw: None,
                    }))),
                })))
            })
            .collect();

        ObjectLit {
            span: Default::default(),
            props,
        }
    }

    /// Transform a call expression if it's a translation function
    fn transform_call(&mut self, call: &CallExpr) -> Option<CallExpr> {
        // Check if callee is an identifier
        let callee_ident = match &call.callee {
            Callee::Expr(expr) => match expr.as_ref() {
                Expr::Ident(ident) => ident,
                _ => return None,
            },
            _ => return None,
        };

        let func_name = atom_to_string(&callee_ident.sym);

        // Check if it's a translation function
        if !IT_FUNCTION_NAMES.contains(&func_name.as_str()) {
            return None;
        }

        let args = &call.args;
        let mut translations: HashMap<String, String> = HashMap::new();
        let mut variables_arg: Option<ExprOrSpread> = None;

        // Handle object syntax: it({ ko: '...', en: '...' })
        if let Some(first_arg) = args.first() {
            if let Expr::Object(obj) = first_arg.expr.as_ref() {
                if let Some(t) = self.extract_object_translations(obj) {
                    translations = t;
                    // Check for variables argument
                    if args.len() > 1 {
                        variables_arg = Some(args[1].clone());
                    }
                }
            }
        }

        // Handle shorthand syntax: it('한글', 'English')
        if translations.is_empty() && args.len() >= 2 {
            if let (Some(first), Some(second)) = (
                args.first().and_then(|a| self.get_string_value(&a.expr)),
                args.get(1).and_then(|a| self.get_string_value(&a.expr)),
            ) {
                let (lang1, lang2) = get_pair_mapping(&func_name);
                translations.insert(lang1.to_string(), first);
                translations.insert(lang2.to_string(), second);

                // Check for variables argument
                if args.len() > 2 {
                    variables_arg = Some(args[2].clone());
                }
            }
        }

        // Skip if no translations extracted (dynamic values)
        if translations.is_empty() {
            return None;
        }

        // Generate hash from first translation value
        let first_value = translations.values().next().unwrap_or(&String::new()).clone();
        let hash = generate_hash(&first_value);

        // Build new arguments: [hash, translations, variables?]
        let mut new_args = vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Str(Str {
                    span: Default::default(),
                    value: hash.into(),
                    raw: None,
                }))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Object(self.build_object_lit(&translations))),
            },
        ];

        if let Some(vars) = variables_arg {
            new_args.push(vars);
        }

        // Create new call expression
        Some(CallExpr {
            span: call.span,
            ctxt: call.ctxt,
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                self.config.runtime_function.clone().into(),
                Default::default(),
                Default::default(),
            )))),
            args: new_args,
            type_args: None,
        })
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_expr(&mut self, expr: &mut Expr) {
        expr.visit_mut_children_with(self);

        if let Expr::Call(call) = expr {
            if let Some(new_call) = self.transform_call(call) {
                *expr = Expr::Call(new_call);
            }
        }
    }
}

#[plugin_transform]
pub fn process_transform(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {
    let config: PluginConfig = serde_json::from_str(
        &metadata.get_transform_plugin_config()
            .unwrap_or_else(|| "{}".to_string())
    ).unwrap_or_default();

    program.visit_mut_with(&mut TransformVisitor::new(config));
    program
}
