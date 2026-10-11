import { SlidersHorizontal } from 'lucide-react'

export default function Chips({ options, value, onChange, showFilter = true, size = 'md' }) {
  return (
    <div className={`chips chips--${size}`}>
      <div className="chips__row" role="tablist">
        {options.map((o) => (
          <button
            key={o}
            role="tab"
            aria-selected={value === o}
            className={'chip' + (value === o ? ' is-active' : '')}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
      {showFilter && (
        <button className="chips__filter" aria-label="상세 필터"><SlidersHorizontal size={20} /></button>
      )}
    </div>
  )
}
