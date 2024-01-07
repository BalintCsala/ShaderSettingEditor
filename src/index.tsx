import "./index.css";

/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import App from "./App";
import Auth from "./Auth";

const root = document.getElementById("root");

render(
    () => (
        <Router>
            <Route path="/" component={App} />
            <Route path="/auth/callback" component={Auth} />
        </Router>
    ),
    root!,
);
