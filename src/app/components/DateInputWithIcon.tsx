import React, { forwardRef } from 'react';

// Definisci il componente DateInputWithIcon
const DateInputWithIcon = forwardRef<HTMLInputElement, { label: string; style?: React.CSSProperties; [x: string]: any }>(
  ({ label, style, ...props }, ref) => {
    return (
      <div style={{ position: 'relative', width: style?.width || '100%' }}>
        <input
          ref={ref}
          {...props}
          placeholder={label} // Usa la label come placeholder
          style={{
            padding: '12px 16px',
            border: '1px solid transparent',
            fontSize: '16px',
            backgroundColor: 'transparent',
            flex: 1,
            borderRadius: '4px',
            transition: 'border-color 0.3s',
            ...style,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <img src="/calendar.png" alt="Calendar" width={35} height={24} />
        </div>
      </div>
    );
  }
);

DateInputWithIcon.displayName = 'DateInputWithIcon';

export default DateInputWithIcon;
