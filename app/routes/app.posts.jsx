import { Outlet, Link, useLocation } from "react-router";

function PostPage() {
    return (
        <s-page title="Posts">
            <s-box padding="400">
                <Outlet />
            </s-box>
        </s-page>
    );
}

export default PostPage;