import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SimpleRadio',
  props: {
    modelValue: [String, Number, Boolean],
    value: [String, Number, Boolean],
    label: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      const isChecked = props.modelValue === props.value;

      return (
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          marginRight: '16px',
        }}>
          {/* 隐藏原生单选框，但保留功能 */}
          <input
            type="radio"
            checked={isChecked}
            value={props.value}
            onChange={() => emit('update:modelValue', props.value)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />

          {/* 自定义黑色线条包装盒 */}
          <span style={radioBoxStyle}>
            {isChecked && <span style={radioInnerStyle} />}
          </span>

          {/* 文本标签 */}
          {props.label && <span style={textStyle}>{props.label}</span>}
        </label>
      );
    };
  },
});

// === 样式定义（纯黑线条风格） ===



// 外圈：纯黑线条
const radioBoxStyle = {
  width: '16px',
  height: '16px',
  border: '2px solid #000000', // 2px 黑色实线
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

// 内圈：选中时呈现的黑色实心圆点
const radioInnerStyle = {
  width: '8px',
  height: '8px',
  backgroundColor: '#000000', // 纯黑实心
  borderRadius: '50%',
};

const textStyle = {
  marginLeft: '8px',
  fontSize: '14px',
  color: '#000000',
};