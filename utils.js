async function racePromises(promises) {
    try {
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
    } catch (error) {
        return;
    }
}

module.exports = { racePromises }