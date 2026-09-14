const r=[];const hasAppInScrollSubscribers=e=>{return r.includes(e)};const addAppInScrollSubscribers=e=>{r.push(e);};const removeAppFromScrollSubscribers=e=>{r.splice(r.indexOf(e),1);};

export { addAppInScrollSubscribers, hasAppInScrollSubscribers, removeAppFromScrollSubscribers };
