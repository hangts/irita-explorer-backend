import sha256 from 'sha256';

export function getAwayNewClassPath(scChain: string, destChain: string, tibClass: string) {
    let newClassPath = '';
    if (tibClass.startsWith('nft') && tibClass.includes('/')) {
        // nft/A/B/class -> nft/A/B/C/class
        // [nft][A][B][class] -> [nft][A][B][C][class]
        let classSplit = tibClass.split('/')
        const classData = classSplit.slice(0, classSplit.length - 1)
        classData.push(destChain, classSplit[classSplit.length - 1])
        newClassPath = classData.join('/')
    } else {
        // class -> nft/A/B/class
        newClassPath = concatClassPath(scChain, destChain, tibClass)
    }

    return newClassPath;
}

//fullClassPath = "nft" + "/" + packet.SourceChain + "/" + packet.DestinationChain + "/" + data.Class
export function concatClassPath(scChain: string, destChain: string, tibClass: string) {
    return `nft/${scChain}/${destChain}/${tibClass}`
}

export function getBackNewClassPath(tibClass: string) {
    let newClassPath = '';
    let classSplit = tibClass.split('/')
    if (classSplit.length === 4) {
        // nft/A/B/class -> class
        newClassPath = classSplit[3]
    } else {
        // nft/A/B/C/class -> nft/A/B/class
        const classData = classSplit.slice(0, classSplit.length - 2)
        classData.push(classSplit[classSplit.length - 1])
        newClassPath = classData.join('/')
    }
    return newClassPath
}

export function TibcClass(classPath: string, baseClass: string) {
    if (!classPath) {
        return baseClass
    }
    return `tibc-${sha256(classPath + '/' + baseClass).toUpperCase()}`
}

// Examples:
//
// 	- "nft/A/B/dog" => ClassTrace{Path: "nft/A/B", BaseClass: "dog"}
// 	- "dog" => {Path: "", BaseClass: "dog"}
export function ParseClassTrace(rawClass: string) {
    let classSplit = rawClass.split('/')
    if (classSplit[0] === rawClass) {
        return {
            path: "",
            base_class: rawClass,
        }
    }

    return {
        path: classSplit.slice(0, classSplit.length - 1).join('/'),
        base_class: classSplit[classSplit.length - 1],
    }
} 