import { useLoaderData } from "react-router";

export async function loader({params}) {
    const tasks = [
        {
            id: 1,
            task: "learn Remix"
        },
        {
            id: 2,
            task: "learn more Remix"
        },
        {
            id: 3,
            task: "learn Shipify app dev"
        }
    ]

    const task = tasks.find(t => t.id === Number(params.id))

    if (!task) {
        throw new Response("Not found", { status: 404 })
    }

    return { task}
}

function TaskDetails() {

    const { task } = useLoaderData()

    console.log(task)

    return (
        <s-page >
            <s-heading>Szczegóły zadania: {task.task}</s-heading>
        </s-page>
    );
}

export default TaskDetails;