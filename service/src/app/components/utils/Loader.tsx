
export default function Loader({ tailwindWidth } : { tailwindWidth?: string }) {
    const tailwind: string = `loader ${tailwindWidth ? tailwindWidth : "w-10"}`

    return (
        <div className={tailwind}></div>
    )
}
