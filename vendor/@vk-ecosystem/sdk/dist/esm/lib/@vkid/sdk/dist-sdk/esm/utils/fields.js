function deleteUnnecessaryFields(fields, obj) {
    const res = {
        ...obj
    };
    fields.forEach((item)=>{
        if (item in res) {
            delete res[item];
        }
    });
    return res;
}

export { deleteUnnecessaryFields };
