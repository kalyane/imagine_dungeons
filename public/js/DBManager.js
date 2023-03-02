export default class DBManager
{
    constructor(id_agent)
    {
        this.id_agent = id_agent;
    }

    async getObject() {
        try {
          const response = await fetch("/agents/object/" + this.id_agent);
          const user_object = await response.json();
          if (Object.keys(user_object).length === 0){
            return null
          }
          return user_object;
        } catch (error) {
          console.error(error);
        }
    }

    async saveObject(user_object) {
        try {
          const response = await fetch("/agents/object/" + this.id_agent, {
            method: "PUT",
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