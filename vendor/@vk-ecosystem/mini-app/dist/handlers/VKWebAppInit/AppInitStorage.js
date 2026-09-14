const p=[];const hasAppInInitializedApps=e=>{return p.includes(e)};const addAppInInitializedApps=e=>{p.push(e);};const removeAppFromInitializedApps=e=>{p.splice(p.indexOf(e),1);};

export { addAppInInitializedApps, hasAppInInitializedApps, removeAppFromInitializedApps };
