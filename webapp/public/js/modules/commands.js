async function cmdGoto() {
  const waypoint = document.querySelector("#select-goto").value;

  const res = await fetch("/command/goto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serial: sessionStorage.getItem("selectedSerial"),
      waypoint: waypoint,
    }),
  });
  const data = await res.json();
  console.log(data);
}

export { cmdGoto };
