
// Utilidad para manejo de fechas en zona horaria de Buenos Aires
export const BUENOS_AIRES_TIMEZONE = 'America/Argentina/Buenos_Aires';

// Convierte una fecha a string en formato YYYY-MM-DD en timezone de Buenos Aires
export const formatDateForBuenosAires = (date: Date): string => {
  // Usar directamente los valores de la fecha local para evitar conversiones incorrectas
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Convierte una fecha seleccionada del calendar a string en formato YYYY-MM-DD
export const formatSelectedDateForBuenosAires = (date: Date): string => {
  // Para fechas seleccionadas del calendar, usar directamente los valores
  // sin conversión de timezone para evitar desplazamientos
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  console.log('Selected date original:', date);
  console.log('Formatted for Buenos Aires:', `${year}-${month}-${day}`);
  
  return `${year}-${month}-${day}`;
};

// Obtiene la fecha actual en timezone de Buenos Aires
export const getTodayInBuenosAires = (): string => {
  const now = new Date();
  // Usar formatDateForBuenosAires consistentemente
  return formatDateForBuenosAires(now);
};

// Convierte string YYYY-MM-DD a Date object para el calendar
export const parseStringToDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  const [year, month, day] = dateString.split('-').map(Number);
  // Crear fecha en timezone local para evitar desplazamientos
  // Usar new Date(year, month - 1, day) en lugar de Date.parse para mayor precisión
  const date = new Date(year, month - 1, day);
  
  console.log('Parsing string to date:', dateString, '-> Date object:', date);
  return date;
};

// Nueva función para formatear fechas de visualización consistentemente
export const formatDisplayDate = (dateString: string): string => {
  const date = parseStringToDate(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
};

// Valida que una fecha no sea anterior a hoy (en timezone de Buenos Aires)
export const isDateBeforeToday = (dateString: string): boolean => {
  const today = getTodayInBuenosAires();
  return dateString < today;
};

// Obtiene la fecha de mañana en timezone de Buenos Aires
export const getTomorrowInBuenosAires = (): string => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForBuenosAires(tomorrow);
};

// Calcula la diferencia en días entre dos fechas
export const calculateDaysDifference = (checkIn: string, checkOut: string): number => {
  const checkInDate = parseStringToDate(checkIn);
  const checkOutDate = parseStringToDate(checkOut);
  
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
