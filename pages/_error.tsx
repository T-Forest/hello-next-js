import { ErrorProps } from "next/error";

function AppError({ statusCode, title }: ErrorProps) {
  if (statusCode === 401) {
    return (
      <>
        <div>require login(仮)</div>
      </>
    );
  }
  return (
    <>
      <div>Error</div>
      <div>status: {statusCode}</div>
      <div>title: {title}</div>
    </>
  );
}

export default AppError;
