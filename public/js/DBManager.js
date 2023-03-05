export default class DBManager
{
  constructor()
  {
    // Get the id_agent value
    this.id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value;
  }

  // Retrieves a user object from the database
  async getObject() {
    try {
      // Send a request to retrieve the user object associated with the current agent
      const response = await fetch("/agents/object/" + this.id_agent);
      const user_object = await response.json();
      // If the object is empty, return null
      if (Object.keys(user_object).length === 0){
        return null
      }
      return user_object;
    } catch (error) {
      console.error(error);
    }
  }

  // Saves the user object to the database
  async saveObject(user_object) {
    try {
      // Send a request to save the user object associated with the current agent
      const response = await fetch("/agents/object/" + this.id_agent, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_object
        })
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
}