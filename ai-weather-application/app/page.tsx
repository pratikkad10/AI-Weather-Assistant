import Image from "next/image";

export default async function Home() {

  const response = await fetch('http://localhost:3000/api/users', {
    // Optional: forward some headers, add auth tokens, etc.
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  const data = await response.json();

  console.log(data);

  return (
    <div>
      <h1>Home </h1>
      <pre>Response: {JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
