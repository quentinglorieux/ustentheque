export const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  };

  export function isDateInPast(dateString) {
    const date = new Date(dateString);
    const currentDate = new Date();
    return date < currentDate;
  }