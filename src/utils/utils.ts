
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isLowResolution = () => {
  return screen.width <= 1440
}
function capitalizeFirstLetter(str:string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const unique =(arr:[]) => {
  return Array.from(new Set(arr))
} 

export { sleep, isLowResolution,capitalizeFirstLetter,unique }