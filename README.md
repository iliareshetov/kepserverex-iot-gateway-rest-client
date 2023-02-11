### The following source code was created to support a bachelor's thesis on the following topic:
- [Communication between programmable logic controllers and the warehouse control system](https://urn.fi/URN:NBN:fi:amk-2022053113682)  
![thesis thumbnail](https://www.theseus.fi/bitstream/handle/10024/751738/Reshetov_Ilia.pdf.jpg?sequence=4&isAllowed=y)  

#### Short description:  
A JavaScript REST client has been implemented to support the KEPServerEX IoT Gateway plugin's browse, read, and write APIs.  
Upon establishing the first connection, the browse endpoint will retrieve all communication tags present in the PLC workspace,  
each of which will have the following fields:  
- channelId
- deviceId  
- tagListName  
- tagName  

These tag fields are crucial in effectively mapping real-world devices, such as conveyor crossings, transfer shuttles, etc., in the business logic for control.  
The retrieved tags will then be securely stored in a PostgreSQL database for future read and write operations.

Reshetov, Ilia (2022)
