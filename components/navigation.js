import Link from 'next/link'


const Navigation = () => {
    return (
        <nav id="header" className="w-full z-30 top-0 py-1 sticky bg-gray-900">
            <div className="w-full  mx-auto flex flex-wrap items-center justify-between mt-0 px-6 py-2 ">

                <label htmlFor="menu-toggle" className="cursor-pointer md:hidden block">
                    <svg className="fill-current text-gray-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                        <title>menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </label>
                <input className="hidden" type="checkbox" id="menu-toggle" />

                <div className="hidden md:flex md:items-center md:w-auto w-full order-3 md:order-2" id="menu">
                    <nav>
                        <ul className="md:flex items-center justify-between text-xs font-bold pt-4 md:pt-0 text-gray-500 uppercase">
                            <Link as={`/whatwebuild`} href="/whatwebuild">
                                <a className="inline-block no-underline py-2 px-4" aria-label="Product we ae building">What we build</a>
                            </Link>
                            <Link as={`/techstack`} href="/techstack">
                                <a className="inline-block no-underline py-2 px-4" aria-label="Technology Stack">Techstack</a>
                            </Link>
                            <Link as={`/howwework`} href="/howwework">
                                <a className="inline-block no-underline py-2 px-4" aria-label="Our team and company organization">How we work</a>
                            </Link>
                        </ul>
                    </nav>
                </div>

                <div className="order-1 md:order-1">
                    <a className="flex items-center tracking-wide no-underline hover:no-underline font-bold text-gray-100 text-xl " href="/">
                        <img src="../assets/blog/white-symbol.png" />
                    </a>
                </div>

                <div className="order-2 md:order-3 flex items-center" id="nav-content">

                    <a className="inline-block no-underline hover:text-black" href="#">
                        <svg className="fill-current hover:text-black" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <circle fill="none" cx="12" cy="7" r="3" />
                            <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5S14.757 2 12 2zM12 10c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3S13.654 10 12 10zM21 21v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h2v-1c0-2.757 2.243-5 5-5h4c2.757 0 5 2.243 5 5v1H21z" />
                        </svg>
                    </a>
                </div>
            </div>
        </nav>
    )
}

export default Navigation
