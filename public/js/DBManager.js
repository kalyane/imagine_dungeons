export default class DBManager
{
    constructor()
    {
        this.id_agent = document.getElementsByClassName("agent")[0].getAttributeNode("id_agent").value;
    }

    async getObject() {
        try {
          const response = await fetch("/agents/object/" + this.id_agent);
          const user_object = await response.json();
          return user_object;
        } catch (error) {
          console.error(error);
        }
    }

    async saveObject(user_object) {
        try {
          const response = await fetch("/agents/object/" + this.id_agent, {
            method: "POST",
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