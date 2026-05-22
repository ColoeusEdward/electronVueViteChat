import classNames from "classnames";
import { NButton, NCheckbox, NPopconfirm, NSelect, NSwitch } from "naive-ui";
import { computed, defineComponent, PropType, StyleValue } from "vue";
import { simpleTableColumn } from "~/me";
import SimpleRadio from "../SimpleRadio";

let defData = [{
  interface: 'Serial',
  port: 'COM3',
  baud: '153,6 kB',
  type: 'LASER / LED ( USSC )',
  pos: 'Core Diameter',
  dist: '20.0 m'
}]
let defCol = [
  // { label: 'Interface', prop: 'interface', flex: 1 },
  // { label: 'Port', prop: 'port', flex: 1 },
  // { label: 'Baud', prop: 'baud', flex: 1 },
  { label: '设备类型', prop: 'DriverName', flex: 3 },
  { label: '数据地址', prop: 'Name', flex: 2 },
  // { label: '链接配置', prop: 'ConnectStrings', flex: 1 },
  { label: '数据地址', prop: 'address', flex: 1 },
];
export default defineComponent({
  name: 'simpleTable',
  props: {
    dat: {
      type: Array as PropType<Record<string, string | number | boolean | object>[]>,
      required: false
    },
    col: {
      type: Array as PropType<simpleTableColumn[]>,
      required: false
    },
    addRowRenderFn: {
      type: Function as PropType<() => void>,
      required: false
    },
    addRowProp: {
      type: String,
      required: false
    }
  },
  setup(props) {
    // 1. 定义列配置 (label: 标题, prop: 数据键名, flex: 宽度权重)
    const columns = computed(() => {
      let list: simpleTableColumn[] = props.col || defCol
      return list
    })


    const data = computed(() => {
      let list: Record<string, string | number | boolean | object>[] = props.dat || defData
      return list
    })
    // 2. 模拟数据

    // 3. 样式对象 (保持 JSX 整洁)
    const styles: Record<string, any> = {
      container: { padding: '20px', fontFamily: 'sans-serif' },
      row: { display: 'flex', gap: '8px', textAlign: 'center', marginBottom: '8px' },
      headerItem: { fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' },
      cell: {
        border: '1px solid #333',
        padding: '6px 0',
        fontWeight: 'bold',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '30px',
        fontSize: '22px',
        width: '100%'
      }
    };

    return () => (
      <div style={styles.container} class={'my-simple-table'}>
        {/* 表头渲染 */}
        <div style={styles.row}>
          {columns.value.map(col => (
            <div key={col.prop} style={{ flex: col.flex, ...styles.headerItem }}>
              {col.label}
            </div>
          ))}
        </div>

        {
          data.value.map((item: Record<string, string | number | boolean | object>) => {
            const buildContent = (col: simpleTableColumn) => {
              let res = item[col.prop]
              if (col.btnText) {
                res = col.btnText
              }
              if (col.mapFn) {
                res = col.mapFn(col, item)
              }
              return res
            }
            return (

              <div style={styles.row}>
                {columns.value.map((col, i) => {
                  let res = (
                    <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{ flex: col.flex, ...styles.cell }} onClick={() => {
                      col.btnFn && col.btnFn(col, item)
                    }}>

                      {buildContent(col)}
                      {/* {data.value[col.prop]} */}
                    </div>
                  )
                  if (col.isInput && !item.isNewRow) {
                    res = (
                      <input
                        onClick={() => {
                          col.btnFn && col.btnFn(col, item)
                        }}
                        class={classNames({ 'invisible': item.isNewRow && i != 0 })}
                        key={col.prop}
                        onChange={(e: any) => {
                          item[col.prop] = e.target.value
                          col.inputUpdateFn && col.inputUpdateFn(col, item)
                        }} style={{ flex: col.flex, ...styles.cell, textAlign: 'center' }} value={buildContent(col)} />
                    )
                  }
                  if (col.btnType == 'danger') {
                    res = <NPopconfirm placement="right" title=""
                      v-slots={{
                        default: () => {
                          return <div>确定吗?</div>
                        },
                        trigger: () => {
                          return <div
                            class={classNames({ 'invisible': item.isNewRow && i != 0 })}
                            key={col.prop} style={{ flex: col.flex, ...styles.cell }} onClick={() => {
                              // col.btnFn && col.btnFn(col, item)
                            }}>

                            {buildContent(col)}
                            {/* {data.value[col.prop]} */}
                          </div>
                        }
                      }}
                      onPositiveClick={() => { col.btnFn && col.btnFn(col, item) }}>
                    </NPopconfirm>
                  }
                  if (col.isCheckbox) {
                    res = <NCheckbox v-model:checked={item[col.prop]} size="large" ></NCheckbox>
                  }
                  if (col.isSwitch) {
                    let text = col.mapFn && col.mapFn(col, item)
                    res = <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{ flex: col.flex, ...styles.cell }}>
                      <NSwitch v-model:value={item[col.prop]} onUpdate:value={() => { col.btnFn && col.btnFn(col, item) }} size="large" checkedValue={1} uncheckedValue={0} v-slots={{
                        checked: () => { return <div >{text}</div> },
                        unchecked: () => { return <div class={'text-black'}>{text}</div> }
                      }}  ></NSwitch>
                    </div>

                  }

                  if (col.isRadio) {
                    res = <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{ flex: col.flex, ...styles.cell, backgroundColor: !!item[col.prop] ? '#456e9c' : '#fff', color: !!item[col.prop] ? '#fff' : '#333' }} onClick={() => { col.btnFn && col.btnFn(col, item) }}>
                      {col.mapFn && col.mapFn(col, item)}
                    </div>
                  }

                  if (col.isSelect) {
                    // let text = col.mapFn && col.mapFn(col, item)
                    res = <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{ flex: col.flex, ...styles.cell, padding: '0', border: 'none' }}> <NSelect style={{ height: '100%' }} v-model:value={item[col.prop]} size="large" onUpdate:value={() => { col.btnFn && col.btnFn(col, item) }} options={col.selectOption} clearable></NSelect>
                    </div>
                  }
                  // if (item.isNewRow && col.prop != props.addRowProp) {
                  //   res = <span></span>
                  // }
                  return res
                })}
                {/* {
                  props.addRowRenderFn && props.addRowRenderFn((<div key={col.prop} style={{ flex: col.flex, ...styles.cell }} onClick={() => {
                      col.btnFn && col.btnFn(col, item)
                    }}>

                      {buildContent(col)}
                    </div>))
                } */}
              </div>
            )
          })
        }

      </div >
    );
  }

})