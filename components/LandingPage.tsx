import { LoginBox, TopBarDark } from '@/components/index'

export default async function LandingPage() {
  return (
    <>
      <div className="app__landingpage">
        <TopBarDark isGuest={true} />
        <div className="bg-gray-700 pb-10 pt-32 px-6 md:flex items-start md:space-x-4 justify-center">
          <LoginBox />
        </div>
        <div className="mt-auto bg-gray-800 p-4 text-white fixed bottom-0 w-full">
          <div className="text-white text-center text-xs">&copy; SWSOS</div>
        </div>
      </div>
    </>
  )
}
