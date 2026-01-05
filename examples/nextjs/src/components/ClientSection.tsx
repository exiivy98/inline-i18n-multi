'use client'

import { it, T } from 'inline-i18n-multi-next/client'

export function ClientSection() {
  return (
    <div className="section">
      <h2>{it('클라이언트 컴포넌트', 'Client Component')}</h2>
      <p>
        {it(
          '이 섹션은 클라이언트에서 렌더링됩니다. "use client" 지시어를 사용합니다.',
          'This section is rendered on the client. Uses "use client" directive.'
        )}
      </p>

      {/* Using T component */}
      <p>
        <T
          ko="T 컴포넌트를 사용하면 더 깔끔하게 번역할 수 있습니다."
          en="Using the T component makes translations cleaner."
          ja="Tコンポーネントを使うとよりクリーンに翻訳できます。"
        />
      </p>

      {/* With variables */}
      <p>
        <T ko="{count}개의 항목이 있습니다" en="There are {count} items" ja="{count}件あります" count={42} />
      </p>
    </div>
  )
}
