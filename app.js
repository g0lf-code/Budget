// Budget Controller :

var budgetModule = (function(){
    
    var Expense = function(id,descr,value){
        this.id=id;
        this.descr=descr;
        this.value=value;
        this.percentage= -1;
    };  //FUNCTION CONSTRUCTOR
    
    Expense.prototype.calcPercent = function(totalInc){
        if(totalInc > 0)
        {this.percentage = Math.round((this.value/totalInc)*100);}
        else{
            this.percentage= -1;
        }
    };
    
    Expense.prototype.getPercent = function(){
      return this.percentage;  
    };
    
    var Income = function(id,descr,value){
        this.id=id;
        this.descr=descr;
        this.value=value;
    };   //FUNCTION CONSTRUCTOR
    
    var calcTotal=function(type){
      var sum=0; 
        data.allItem[type].forEach(function(curr){
            sum+= curr.value;
        });
        data.totals[type]=sum;
    };
    
    var data = {
        allItem : {
            exp :[],
            inc : []
        },
        totals : {
            exp : [],
            inc : []
        },                       // allItem & totals are objects we created for sake of organising our data.
        
        budget : 0, 
        percentage : -1
    };
    
    // Create public function to access elements :
    return{
        addItem : function(type,des, val){
            var newItem, ID;
            
            //Create new ID
            if(data.allItem[type].length >0)
                ID= data.allItem[type][data.allItem[type].length - 1].id + 1;
            else
                ID=0;
            //create a new item based on 'inc' or 'exp' type
            if(type==='exp')
                newItem = new Expense(ID, des, val);
            else if(type==='inc')
                newItem = new Income(ID, des, val);
            
            //push it into data structure
            data.allItem[type].push(newItem);
            
            //Return the new Element
            return newItem;
        },
        
        deleteItem : function(type, id){
           var ids, index;
            
            ids = data.allItem[type].map(function(current){  // map method returns an new array. compared to Foreach method which returns a copy of array;
               return current.id;
           });
            index = ids.indexOf(id);
            
            if(index!== -1){
                data.allItem[type].splice(index,1);
            }
        },
        
        calculatePercent : function(){
          
            data.allItem.exp.forEach(function(cur){
               cur.calcPercent(data.totals.inc); 
            });
        },
        
        getPercentage : function(){  // used map to return something bcz forEach doesnt.
          
            var allPerc = data.allItem.exp.map(function(cur){
                return cur.getPercent();
            });
            return allPerc;
        },
                
        
        calcBudget : function(){
        
            // 1. Calculate total income and expense
            calcTotal('exp');
            calcTotal('inc');
            
            // 2. Calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. Calculate th percent of the budget spent 
            if(data.totals.inc > 0)
            {data.percentage =  Math.round((data.totals.exp / data.totals.inc)*100);}
            else{
                data.percentage = -1; 
            }
        },
        
        getBudget : function(){
          return{
              budget : data.budget,
              totalInc : data.totals.inc,
              totalExp : data.totals.exp,
              percentage : data.percentage
          }  
        },
        
        testing : function(){
            console.log(data);
        }
        
    };
    
    
      
})();

// UI Controller :

var UIModule = (function(){
    //to get input we create a public method
    
    var formatNumber = function(num, type){
        num = Math.abs(num);
        num = num.toFixed(2);  // this is method of NUMBER prototype
        
        numSplit=num.split('.');
        
        int = numSplit[0];
        if(int.length>3){
            int =  int.substr(0,int.length-3)+','+int.substr(int.length-3,3)
        }
        dec = numSplit[1];
        
        return (type==='exp'? '-' : '+') + ' ' +int+'.'+dec;
        
    };
    
    // function to traverse nodeList
    var nodeLists = function(list,callback){
                for(var i=0; i<list.length; i++){
                    callback(list[i], i);
                }  
            };
    
   
    
    return {
        getInput: function(){
        return{
            type: document.querySelector('.add__type').value,
            description: document.querySelector('.add__description').value,
            value: parseFloat(document.querySelector('.add__value').value)
        };
        
    },
        addListItem : function(obj,type) {
          var html, newHTML, element;
            // Create HTML string with placeholder text
            if(type==='inc')
                {
                    element = '.income__list';
                    
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }
            else if (type==='exp')
            {
                element = '.expenses__list';
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>'
            }
            
            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.descr);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value,type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
        },
    
    deleteListItem : function(delID){
      
        var el= document.getElementById(delID);
        el.parentNode.removeChild(el);
        
    },
        
        
    clearFields: function(){
      var fields, fieldsArr;
        fields = document.querySelectorAll('.add__description' + ',' + '.add__value'); // ** querySelectorAll returns an list so it sucks to clear that one by one as we cant erase entire list at once;
        
        fieldsArr = Array.prototype.slice.call(fields);  //converts fields List to array and stores in fieldsArr
        
        fieldsArr.forEach(function(currentVal, index, array){  //function here is the Callback function.
           currentVal.value = ""; 
        });
        
        fieldsArr[0].focus();
        
        },
        
        displayBudget : function(obj){
            var type;
            if(obj.budget===0){
                document.querySelector('.budget__value').textContent = 'Hello..!!'
            }
            else{
                obj.budget>=0 ? type='inc' : type='exp';
                document.querySelector('.budget__value').textContent = formatNumber(obj.budget,type);
            }
           // obj.budget>=0 ? type='inc' : type='exp';
            
            // document.querySelector('.budget__value').textContent = formatNumber(obj.budget,type);
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage >0)
            {document.querySelector('.budget__expenses--percentage').textContent = obj.percentage+'%';}
            else
            {document.querySelector('.budget__expenses--percentage').textContent = '0_0';
            }
        },
        
        listPercent : function(percentage){
          
             var fields = document.querySelectorAll('.item__percentage');
            
            // nodeList was Here : 
            
            nodeLists(fields, function(current, index){
                
                if(percentage[index]>0)
                    current.textContent = percentage[index]+ '%';
                else
                    current.textContent = '*_0)';
                
            });
        },
        
        displayMonth : function(){
          var now, months, month, year;
            now = new Date();
            
            months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            
            year= now.getFullYear();
            month=now.getMonth();
            
            document.querySelector('.budget__title--month').textContent = months[month] +' '+year;
        },
        
        changeColor: function(){
          
            var fields = document.querySelectorAll(
            '.add__type'+','+'.add__description'+','+'.add__value');
            
            nodeLists(fields,function(cur){
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector('.add__btn').classList.toggle('red');
            
        },
};


})();



// GLOBAL Controller : 

var controller = (function(budget,UImod){
  
    var setupListeners = function(){
        document.querySelector('.add__btn').addEventListener('click',ctrlAdditem);
    
        document.addEventListener('keypress',function(event){
        if(event.keyCode===13)
        { ctrlAdditem(); }
        
        }); 
        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
        
        document.querySelector('.add__type').addEventListener('change', UIModule.changeColor)
        
    };
    
    var updateBudget = function(){
      
        // 1. Calculate Budget 
        budgetModule.calcBudget();
        
        // 2. Return the Budget
        var budget= budgetModule.getBudget();
        
        // 3. Display the budget
        UIModule.displayBudget(budget);
        
        //console.log(budget);
        
    };
	
	 var updatePercentages = function(){
      
        // 1. calculate percentage
        budgetModule.calculatePercent();
         
        // 2. read percebtage from the budget controller
        var perc = budgetModule.getPercentage();
         
        // 3. Update the UI with new Percentage
        UIModule.listPercent(perc);
        
    };
    
    var ctrlAdditem = function(){
        var input, newItem;
        
        // 1. get the field input data
        input = UIModule.getInput();
        //console.log(input);
        
        if(input.description !=="" && !isNaN(input.value) && input.value > 0)
        {
            // 2. Add the item to budget controller
        newItem =  budgetModule.addItem(input.type, input.description, input.value);
        
        // 3. add the item to UI
        UIModule.addListItem(newItem, input.type);
        
        // 4. Clear the Fields
        UIModule.clearFields();
        
        // 5. Calculate the budget
        updateBudget();
            
        // 6. Calculate and Update percentages
        updatePercentages();    
        
        }
        
    };
    
    var ctrlDeleteItem = function(event){
      var itemID, splitID,type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        // incc-1
        if(itemID){
            splitID=itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
                
        // 1. Delete the item from data structure
        budgetModule.deleteItem(type, ID);
        
        // 2. Delete the item from UI
        UIModule.deleteListItem(itemID);
        
        // 3. Update and show the new budget
        updateBudget();
        
        // 4. Calculate and Update percentages
        updatePercentages();
    
        }
    };

    //***********PUBLIC INIT FUNCTION**************//

    return{
    init : function(){
        console.log('Application has started.');
        
        document.querySelector('.add__type').value = 'inc';
        UIModule.displayMonth();
        UIModule.displayBudget({
              budget : 0,
              totalInc : 0,
              totalExp : 0,
              percentage : -1
          }  );
        setupListeners();
        
    } 
};    
    
})(budgetModule,UIModule);

controller.init();