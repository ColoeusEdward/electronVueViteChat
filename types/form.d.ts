type commonForm = {
  ProtoType?: string,
  Name?: string,
  id?: string,
} & Record<string, string>

type connectDevForm = {
  Interface?: string,
  Port?: string,
  DeviceType?: string,
  PositionName?: string,
  id?: string,
} & Record<string, string>
