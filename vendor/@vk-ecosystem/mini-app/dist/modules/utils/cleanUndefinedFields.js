const cleanUndefinedFields=({...e})=>{Object.keys(e).forEach(n=>e[n]===undefined&&delete e[n]);return e};

export { cleanUndefinedFields };
