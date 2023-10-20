import { renderToReadableStream } from 'react-dom/server'

const server = Bun.serve({
    hostname: "localhost",
    port: 3000,
    fetch: fetchHandler,
})

console.log(`BUN running on ${server.hostname}:${server.port}`)

type BucketItem = { id: number; name: string }
const items: BucketItem[] = [];

async function fetchHandler(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if(url.pathname === "" || url.pathname === "/") {
        return new Response(Bun.file("index.html"))
    }

    if(url.pathname === "/items" && request.method === 'GET') {
     const stream = await renderToReadableStream(<BucketItemList items={items}/>)
     return new Response(
        stream,
        { headers: { 'Content-Type': "text/html" }}
     )
    }

    if(url.pathname === "/items" && request.method === 'POST') {
        const { item } = await request.json()
        items.push({
            id: items.length + 1,
            name: item,
        })
        const stream = await renderToReadableStream(<BucketItemList items={items}/>)
        return new Response(
            stream,
            { headers: { 'Content-Type': "text/html" }}
         )
    }

    return new Response("Not Found", { status: 404 })
}

function BucketItemList(props: { items: BucketItem[]}) {
    return (
        <ul className='px-4 mt-4 list-disc text-blue-600'>
            {props.items.length ? (
               props.items.map((item) => (
                <li key={`item-${item.id}`} className='mb-2 text-lg text-gray-800'>
                   {item.name}
                </li>
               ))
            ) : (
            <li>No Items Found</li>
            )}
        </ul>
    )
}