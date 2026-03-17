import { Header } from "./Header";
import { Hero } from "./Hero";
import { Info } from "./Info";
import { Feedback } from "./Feedback";
import { Footer } from "./Footer";

export function Home() {

    return (
        <>
            <Header />
            <main className="relative bg-[#03110d] divide-y divide-emerald-300/15">
                <Hero />
                <Info />
                <Feedback />
            </main>
            <Footer />
        </>
    )
}
