import classNames from "classnames";
import { NButton, NCheckbox, NPopconfirm, NSelect, NSwitch } from "naive-ui";
import { computed, defineComponent, PropType, reactive, StyleValue, watch } from "vue";
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
    },
    isSmallPadding: {
      type: Boolean,
      default: false
    },
    // renderBtn: {
    //   type: Function as PropType<() => void>,
    //   required: true
    // },
    addAndEditAndDelFn: {
      type: Object as PropType<[Function, Function, Function]>,
      required: true
    },
    btnShowList: {
      type: Array as PropType<number[]>,
      default: [1, 0, 1],
      required: false
    },
    rowClickFn: {
      type: Function as PropType<(e: any, row: any) => void>,
      required: true
    },
    originMode: {
      type: Boolean,
      default: false
    },
    defIsEditing: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 1. 定义列配置 (label: 标题, prop: 数据键名, flex: 宽度权重)
    const columns = computed(() => {
      let list: simpleTableColumn[] = props.col || defCol
      return list
    })
    const alldata = reactive({
      curRow: null as Record<string, string | number | boolean | object> | null,
      isEditing: props.originMode || props.defIsEditing
    })

    const data = computed(() => {
      let list: Record<string, string | number | boolean | object>[] = props.dat || defData
      return list
    })

    watch(() => props.dat, () => {
      let item = data.value.find(e => e.GId === alldata.curRow?.GId)
      alldata.curRow = item || null
      item && props.rowClickFn && props.rowClickFn(null, alldata.curRow)
    })
    // 2. 模拟数据

    // 3. 样式对象 (保持 JSX 整洁)
    const styles: Record<string, any> = {
      container: { padding: props.isSmallPadding ? '8px' : '20px', fontFamily: 'sans-serif' },
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
      },
      cellIsChoose: {
        // backgroundColor: 'transparent',
        // color: '#fff',
        // borderColor: '#fff'
      }
    };

    return () => (
      <div style={styles.container} class={'my-simple-table h-full'}>
        <div style={{
          height: 'calc(100% - 60px)',
        }} class={' overflow-auto'}>
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

                <div style={styles.row} class={classNames(' relative overflow-visible', { 'is-selected': item.GId == alldata.curRow?.GId && !props.originMode })} onClick={() => {
                  alldata.curRow = item
                  console.log("🪵 [index.tsx:139] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
                  props.rowClickFn && props.rowClickFn({}, item)
                }}>
                  {
                    !alldata.isEditing && <div class={'absolute w-full h-full bg-transparent  z-30'}></div>
                  }
                  {columns.value.map((col, i) => {
                    let res = (
                      <div key={col.prop} class={classNames('z-50', { 'invisible': item.isNewRow && i != 0 })} style={{
                        flex: col.flex, ...styles.cell,
                        ...(item.GId == alldata.curRow?.GId ? styles.cellIsChoose : {})
                      }} onClick={() => {
                        col.btnFn && col.btnFn(col, item)
                      }}>

                        {buildContent(col)}
                        {/* {data.value[col.prop]} */}
                      </div>
                    )
                    // if (!alldata.isEditing) {
                    //   return res
                    // }

                    if (col.isInput && !item.isNewRow) {
                      res = (
                        <input
                          onClick={() => {
                            col.btnFn && col.btnFn(col, item)
                          }}
                          class={classNames('bg-transparent', { 'invisible': item.isNewRow && i != 0, })}
                          key={col.prop}
                          onChange={(e: any) => {
                            item[col.prop] = e.target.value
                            col.inputUpdateFn && col.inputUpdateFn(col, item)
                          }} style={{
                            flex: col.flex, ...styles.cell,
                            textAlign: 'center',
                            ...(item.GId == alldata.curRow?.GId ? styles.cellIsChoose : {})
                          }} value={buildContent(col)} />
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
                              key={col.prop} style={{
                                flex: col.flex,
                                ...styles.cell,
                                ...(item.GId == alldata.curRow?.GId ? styles.cellIsChoose : {})
                              }} onClick={() => {
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
                      res = <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{
                        flex: col.flex, ...styles.cell,
                        ...(item.GId == alldata.curRow?.GId ? styles.cellIsChoose : {})
                      }}>
                        <NSwitch v-model:value={item[col.prop]} onUpdate:value={() => { col.btnFn && col.btnFn(col, item) }} size="large" checkedValue={1} uncheckedValue={0} v-slots={{
                          checked: () => { return <div >{text}</div> },
                          unchecked: () => { return <div class={'text-black'}>{text}</div> }
                        }}  ></NSwitch>
                      </div>

                    }

                    if (col.isRadio) {
                      res = <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{
                        flex: col.flex, ...styles.cell, backgroundColor: !!item[col.prop] ? '#456e9c' : '#fff', color: !!item[col.prop] ? '#fff' : '#333',
                        ...(item.GId == alldata.curRow?.GId ? styles.cellIsChoose : {})
                      }} onClick={() => { col.btnFn && col.btnFn(col, item) }}>
                        {col.mapFn && col.mapFn(col, item)}
                      </div>
                    }

                    if (col.isSelect) {
                      // let text = col.mapFn && col.mapFn(col, item)
                      res = <div key={col.prop} class={classNames({ 'invisible': item.isNewRow && i != 0 })} style={{
                        flex: col.flex, ...styles.cell, padding: '0', border: 'none',
                        ...(item.GId == alldata.curRow?.GId ? styles.cellIsChoose : {})

                      }}> <NSelect style={{ height: '100%' }} v-model:value={item[col.prop]} size="large" onUpdate:value={() => { col.btnFn && col.btnFn(col, item) }} options={col.selectOption} ></NSelect>
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


        </div>

        {
          !props.originMode && <div class={'h-[60px] flex items-center justify-start'}>
            {
              !!props.btnShowList[0] && <span class={' w-[22%] max-w-[120px] text-center mr-2  py-2  bg-white text-black border border-gray-500 border-solid'}
                onClick={() => {

                  let fn = props.addAndEditAndDelFn[0];
                  fn && fn({}, alldata.curRow)
                }}>
                新增
              </span>
            }

            {
              !!props.btnShowList[1] && <span class={'w-[22%] max-w-[120px] text-center mr-2  py-2  bg-white text-black border border-gray-500 border-solid'}
                onClick={() => {
                  if (!alldata.curRow) {
                    window.$message.error('请选择一行')
                    return
                  }
                  let fn = props.addAndEditAndDelFn[1];
                  fn && fn({}, alldata.curRow)
                }}>
                编辑
              </span>
            }

            {
              !!props.btnShowList[2] && <NPopconfirm placement="right" title=""
                v-slots={{
                  default: () => {
                    return <div>确定吗?</div>
                  },
                  trigger: () => {
                    return <span class={'w-[22%] max-w-[120px] text-center mr-2  py-2  bg-white text-black border border-gray-500 border-solid'}>
                      删除
                    </span>
                  }
                }}
                onPositiveClick={() => {
                  if (!alldata.curRow) {
                    window.$message.error('请选择一行')
                    return
                  }
                  let fn = props.addAndEditAndDelFn[2];
                  fn && fn({}, alldata.curRow)
                }}>
              </NPopconfirm>
            }




            {/* {props.renderBtn && props.renderBtn()} */}
            <div class={"ml-auto"}>
              <NSwitch value={alldata.isEditing} onUpdate:value={(v: boolean) => {
                alldata.isEditing = v
              }}

                v-slots={{
                  checked: () => { return <div >表格编辑</div> },
                  unchecked: () => { return <div class={'text-black'}>表格编辑</div> }
                }}
                size='large'
              ></NSwitch>
            </div>
          </div >
        }


      </div >
    );
  }

})