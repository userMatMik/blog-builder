import { useLoaderData } from "react-router";
// import { json } from "@remix-run/react";

export async function loader({request}) {

    const data = {message: "Witaj w Remix!"}

    // return json({ message: "Witaj w Remix!" });

    return { data }
}

function HelloPage() {

    const { data } = useLoaderData();

    console.log(data)
    return (
        <s-page>
            <s-heading>{data.message}</s-heading>
        </s-page>
    );
}

export default HelloPage;