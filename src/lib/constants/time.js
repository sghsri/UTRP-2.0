const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));


export { MILLISECOND, SECOND, MINUTE, HOUR, DAY, sleep };