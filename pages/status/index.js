import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Última atualização {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let loadingText = "Carregando...";

  let databaseStatus = {
    maxConnectionsText: loadingText,
    openedConnectionsText: loadingText,
    versionText: loadingText,
  };

  if (!isLoading && data) {
    databaseStatus.maxConnectionsText =
      data.dependencies.database.max_connections;
    databaseStatus.openedConnectionsText =
      data.dependencies.database.opened_connections;
    databaseStatus.versionText = data.dependencies.database.version;
  }

  return (
    <div>
      <h2>Banco de Dados</h2>
      <p>Conexões máximas: {databaseStatus.maxConnectionsText}</p>
      <p>Conexões abertas: {databaseStatus.openedConnectionsText}</p>
      <p>Versão: {databaseStatus.versionText}</p>
    </div>
  );
}
