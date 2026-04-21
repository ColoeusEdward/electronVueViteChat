import { } from "naive-ui";
import { computed, defineComponent, PropType, StyleValue } from "vue";
import { simpleTableColumn } from "~/me";

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
      type: Array as PropType<Record<string, string | number>[]>,
      required: false
    },
    col: {
      type: Array as PropType<simpleTableColumn[]>,
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
      let list: Record<string, string | number>[] = props.dat || defData
      return list
    })
    // 2. 模拟数据

    // 3. 样式对象 (保持 JSX 整洁)
    const styles: Record<string, any> = {
      container: { padding: '20px', fontFamily: 'sans-serif' },
      row: { display: 'flex', gap: '8px', textAlign: 'center' },
      headerItem: { fontWeight: 'bold', fontSize: '22px', marginBottom: '8px' },
      cell: {
        border: '1px solid #333',
        padding: '6px 0',
        fontWeight: 'bold',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '30px',
        fontSize: '26px'
      }
    };

    return () => (
      <div style={styles.container}>
        {/* 表头渲染 */}
        <div style={styles.row}>
          {columns.value.map(col => (
            <div key={col.prop} style={{ flex: col.flex, ...styles.headerItem }}>
              {col.label}
            </div>
          ))}
        </div>

        {
          data.value.map((item: Record<string, string | number>) => {
            const buildContent = (col: simpleTableColumn) => {
              let res = item[col.prop]
              if (col.btnText) {
                res = col.btnText
              }
              return res
            }
            return (

              <div style={styles.row}>
                {columns.value.map((col, i) => {
                  let res = (
                    <div key={col.prop} style={{ flex: col.flex, ...styles.cell }} onClick={() => {
                      col.btnFn && col.btnFn(col, item)
                    }}>

                      {buildContent(col)}
                      {/* {data.value[col.prop]} */}
                    </div>
                  )
                  if (col.isInput) {
                    res = (
                      <input
                        onClick={() => {
                          col.btnFn && col.btnFn(col, item)
                        }}
                        key={col.prop}
                        onChange={(e: any) => {
                          item[col.prop] = e.target.value
                          col.inputUpdateFn && col.inputUpdateFn(col, item)
                        }} style={{ flex: col.flex, ...styles.cell, textAlign: 'center' }} value={buildContent(col)} />
                    )
                  }
                  return res
                })}
              </div>
            )
          })
        }

      </div>
    );
  }

})