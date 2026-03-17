import { useForm } from "react-hook-form";

interface FormData {
  test: string;
}

export function TestForm() {
  console.log("TestForm рендерится");
  
  const { register, handleSubmit } = useForm<FormData>();
  
  const onSubmit = (data: FormData) => {
    console.log("Данные формы:", data);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Тестовая форма</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input 
          {...register("test")} 
          placeholder="Введите текст"
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
}