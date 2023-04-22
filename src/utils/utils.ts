
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isLowResolution = () => {
  return screen.width <= 1440
}

export { sleep, isLowResolution }