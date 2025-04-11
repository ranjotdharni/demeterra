import { PAGE_LOGIN } from "@/lib/constants/routes"

export default function Home() {
  return (
    <section>
      <label>Link to Login Page:</label>
      <a href={PAGE_LOGIN}>Click Here</a>
    </section>
  )
}
