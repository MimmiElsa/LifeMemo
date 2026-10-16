
// Issue #9 – Starting the app: Add child
//
// TODO: add a child, edit a child, get a child, list children
// TODO: remember which child is currently selected



export async function addChild({ name, birthday}){

    const child = createChild(name, birthday)
    await put('children', child)


    const active = await getActiveChild()

    if (!active) {
        await setActiveChild(child.id)
    }

    return child
};