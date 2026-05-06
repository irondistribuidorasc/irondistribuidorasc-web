import net from "node:net";

function parseDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: Number(url.port || "5432"),
  };
}

export async function canReachDatabase(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    return false;
  }

  try {
    const { host, port } = parseDatabaseUrl(databaseUrl);

    return await new Promise<boolean>((resolve) => {
      const socket = net.connect({ host, port });

      const finish = (value: boolean) => {
        socket.removeAllListeners();
        socket.destroy();
        resolve(value);
      };

      socket.setTimeout(250);
      socket.once("connect", () => finish(true));
      socket.once("timeout", () => finish(false));
      socket.once("error", () => finish(false));
    });
  } catch {
    return false;
  }
}
