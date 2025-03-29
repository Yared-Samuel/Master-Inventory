export const productTypes = [
    { type: "finished",  }, // buy and sale
    { type: "forSale",  }, // prepared and ready for sale
    {type: "raw"}, // used to make finished product
    {type: "fixed"}, // fixed asset
    {type: "use-and-throw"}, // disposable
    {type: "others"}, 
]

export const storeType = {
    finished: "finished", // buy and sale
    raw: "raw", // used to make finished product
    fixed: "fixed", // fixed asset
    useAndThrow: "use-and-throw", // disposable
    others: "others", 
}