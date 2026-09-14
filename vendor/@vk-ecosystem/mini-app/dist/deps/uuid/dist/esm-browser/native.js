const o=typeof crypto!=="undefined"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);var r = {randomUUID:o};

export { r as default };
