#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import cluster from "node:cluster";
import os from "node:os";
import http from "node:http";
import debugModule from "debug";

const debug = debugModule("sidebrain:server");
const cpu = os.cpus().length;

async function main() {
  const { default: app } = await import("../app");

  const port = normalizePort(process.env.PORT || "5000");

  if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < (process.env.NODE_ENV === "production" ? cpu : 1); i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    console.log(`Worker ${process.pid} started`);

    const { connectDB, disconnectDB } = await import("../config");

    // Connect once at boot; every request reuses this pool.
    try {
      await connectDB();
    } catch {
      process.exit(1);
    }

    app.set("port", port);

    const server = http.createServer(app);

    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);

    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      process.on(signal, () => {
        server.close(() => {
          void disconnectDB().finally(() => process.exit(0));
        });
      });
    }

    function onListening() {
      const addr = server.address();
      const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
      debug("Listening on " + bind);
    }
  }

  function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
      default:
        throw error;
    }
  }
}

function normalizePort(val: string): number | string | false {
  const port = Number.parseInt(val, 10);

  if (Number.isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

main();
