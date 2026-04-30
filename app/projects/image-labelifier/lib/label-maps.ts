/**
 * Mapping tables from ADE20K segmentation labels to display characters.
 *
 * Three variants:
 *   - Traditional Chinese single characters
 *   - FontAwesome 7 Free solid icon codepoints
 *   - Lookup helpers with fallbacks
 */

// ---------------------------------------------------------------------------
// Traditional Chinese
// ---------------------------------------------------------------------------

export const LABEL_ZH_MAP: Record<string, string> = {
  wall: "壁", building: "樓", sky: "空", floor: "地", tree: "木",
  ceiling: "頂", road: "路", bed: "床", windowpane: "窗", grass: "草",
  cabinet: "櫃", sidewalk: "徑", person: "人", earth: "土", door: "門",
  table: "桌", mountain: "山", plant: "卉", curtain: "簾", chair: "椅",
  car: "車", water: "水", painting: "畫", sofa: "沙", shelf: "架",
  house: "宅", sea: "海", mirror: "鏡", rug: "毯", field: "野",
  armchair: "椅", seat: "座", fence: "籬", desk: "桌", rock: "岩",
  wardrobe: "衣", lamp: "燈", bathtub: "浴", railing: "欄", cushion: "墊",
  base: "基", box: "箱", column: "柱", signboard: "牌", chest: "箱",
  counter: "檯", sand: "沙", sink: "池", skyscraper: "廈", fireplace: "爐",
  refrigerator: "冰", grandstand: "臺", path: "徑", stairs: "梯", runway: "道",
  screen: "幕", stairway: "階", river: "川", bridge: "橋", bookcase: "櫃",
  blind: "簾", "coffee table": "几", toilet: "廁", flower: "花", book: "書",
  hill: "丘", bench: "凳", countertop: "檯", stove: "灶", palm: "椰",
  "kitchen island": "島", computer: "機", "swivel chair": "轉", boat: "舟",
  bar: "酒", arcade: "廊", hovel: "舍", bus: "巴", towel: "巾",
  light: "光", truck: "卡", tower: "塔", chandelier: "燭", awning: "篷",
  streetlight: "燈", booth: "亭", television: "螢", airplane: "飛", "dirt track": "泥",
  apparel: "衣", pole: "桿", land: "陸", bannister: "扶", escalator: "梯",
  ottoman: "墩", bottle: "瓶", buffet: "餐", poster: "報", stage: "臺",
  van: "廂", ship: "船", fountain: "泉", "conveyer belt": "帶", canopy: "幕",
  washer: "洗", plaything: "玩", pool: "池", stool: "凳", barrel: "桶",
  basket: "籃", waterfall: "瀑", tent: "帳", bag: "包", minibike: "摩",
  cradle: "搖", oven: "烤", ball: "球", food: "食", step: "階",
  tank: "罐", trade: "市", microwave: "微", pot: "壺", animal: "獸",
  bicycle: "騎", lake: "湖", dishwasher: "碗", blanket: "被", sculpture: "雕",
  hood: "罩", sconce: "燭", vase: "瓶", "traffic light": "燈", tray: "盤",
  ashcan: "桶", fan: "扇", pier: "埠", "crt screen": "幕", plate: "碟",
  monitor: "幕", "bulletin board": "榜", shower: "淋", radiator: "暖", glass: "杯",
  clock: "鐘", flag: "旗",
};

export function labelToZh(label: string): string {
  return LABEL_ZH_MAP[label] ?? "文";
}

// ---------------------------------------------------------------------------
// FontAwesome 7 Free Solid icons
// ---------------------------------------------------------------------------

export const LABEL_ICON_MAP: Record<string, string> = {
  wall: "\uf0c8", building: "\uf1ad", sky: "\uf0c2", floor: "\uf0c8", tree: "\uf1bb",
  ceiling: "\uf0c8", road: "\uf018", bed: "\uf236", windowpane: "\uf0c8", grass: "\uf4d8",
  cabinet: "\uf0c8", sidewalk: "\uf018", person: "\uf183", earth: "\uf0ac", door: "\uf52b",
  table: "\uf0ce", mountain: "\uf6fc", plant: "\uf4d8", curtain: "\uf0c8", chair: "\uf6c0",
  car: "\uf1b9", water: "\uf043", painting: "\uf03e", sofa: "\uf4b8", shelf: "\uf0c8",
  house: "\uf015", sea: "\uf773", mirror: "\uf0c8", rug: "\ue569", field: "\uf06c",
  armchair: "\uf6c0", seat: "\uf6c0", fence: "\uf0c8", desk: "\uf0ce", rock: "\uf6fc",
  wardrobe: "\uf0c8", lamp: "\uf0eb", bathtub: "\uf2cd", railing: "\uf0c8", cushion: "\uf0c8",
  base: "\uf0c8", box: "\uf466", column: "\uf0c8", signboard: "\uf024", chest: "\uf466",
  counter: "\uf0ce", sand: "\uf0c8", sink: "\ue06d", skyscraper: "\uf1ad", fireplace: "\uf06d",
  refrigerator: "\uf2dc", grandstand: "\uf0c8", path: "\uf018", stairs: "\ue289", runway: "\uf018",
  screen: "\uf26c", stairway: "\ue289", river: "\uf773", bridge: "\ue4c8", bookcase: "\uf02d",
  blind: "\uf0c8", "coffee table": "\uf0ce", toilet: "\uf7d8", flower: "\uf4d8", book: "\uf02d",
  hill: "\uf6fc", bench: "\uf6c0", countertop: "\uf0ce", stove: "\uf06d", palm: "\uf1bb",
  "kitchen island": "\uf0ce", computer: "\uf390", "swivel chair": "\uf6c0", boat: "\uf21a",
  bar: "\uf0ce", arcade: "\uf557", hovel: "\uf015", bus: "\uf207", towel: "\uf0c8",
  light: "\uf0eb", truck: "\uf0d1", tower: "\uf66f", chandelier: "\uf0eb", awning: "\uf0c8",
  streetlight: "\uf0eb", booth: "\uf54e", television: "\uf26c", airplane: "\uf072",
  "dirt track": "\uf018", apparel: "\uf553", pole: "\uf0c8", land: "\uf0ac", bannister: "\uf0c8",
  escalator: "\ue289", ottoman: "\uf4b8", bottle: "\uf0c8", buffet: "\uf0ce", poster: "\uf03e",
  stage: "\uf0c8", van: "\uf0d1", ship: "\uf21a", fountain: "\uf043", "conveyer belt": "\uf0c8",
  canopy: "\uf0c8", washer: "\uf0c8", plaything: "\uf0c8", pool: "\uf5c5", stool: "\uf6c0",
  barrel: "\uf0c8", basket: "\uf0c8", waterfall: "\uf773", tent: "\ue57d", bag: "\uf0c8",
  minibike: "\uf21c", cradle: "\uf236", oven: "\uf06d", ball: "\uf0c8", food: "\uf2e7",
  step: "\ue289", tank: "\uf0c8", trade: "\uf54e", microwave: "\uf0c8", pot: "\uf7b6",
  animal: "\uf1b0", bicycle: "\uf206", lake: "\uf773", dishwasher: "\uf0c8", blanket: "\uf236",
  sculpture: "\uf5a6", hood: "\uf0c8", sconce: "\uf0eb", vase: "\uf0c8",
  "traffic light": "\uf0eb", tray: "\uf0c8", ashcan: "\uf0c8", fan: "\uf863", pier: "\ue4c8",
  "crt screen": "\uf26c", plate: "\uf0c8", monitor: "\uf390", "bulletin board": "\uf03e",
  shower: "\uf2cc", radiator: "\uf0c8", glass: "\uf4e3", clock: "\uf017", flag: "\uf024",
};

export const FA_FALLBACK_ICON = "\uf005"; // star

export function labelToIcon(label: string): string {
  return LABEL_ICON_MAP[label] ?? FA_FALLBACK_ICON;
}
