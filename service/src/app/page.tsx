import { PAGE_LOGIN } from "@/lib/constants/routes"

export default function Home() {
  return (
    <section className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="w-1/4 h-1/4 flex flex-col items-center p-4 space-y-16 border border-light-grey shadow-xl">
        <h1 className="text-xl">Welcome to Demeterra</h1>
        <a className="p-2 border border-light-grey rounded-lg" href={PAGE_LOGIN}>Login</a>
      </div>
    </section>
  )
}
