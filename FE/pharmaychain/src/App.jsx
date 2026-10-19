import getAllMedicines from './api/MedicineAPI';

function App() {

  const response = getAllMedicines();
  return (
    <>
      ${response}
    </>
  )
}

export default App
