async function racePromises(promises) {
    const wrappedPromises = [];
    promises.map((promise, index) => {
        wrappedPromises.push(
            new Promise((resolve) => {
                promise.then(() => {
                    resolve(index);
                })
            })
        )
    })
    return Promise.race(wrappedPromises);
}

module.exports = { racePromises }