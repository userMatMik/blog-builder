import { Outlet } from "react-router";

function TasksLayout() {

    return (
        <s-page title="List of tasks">
            <Outlet />
        </s-page>
    );
}

export default TasksLayout
