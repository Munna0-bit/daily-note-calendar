window.document.onload = myFunc();

function closeForm() {
  var x = document.getElementById("formDiv");
  var y = document.getElementsByClassName("addBTN")[0];
  x.style.display = "none";
  y.style.transform = "rotate(90deg)";
}

function toggleForm() {
  var x = document.getElementById("formDiv");
  var y = document.getElementsByClassName("addBTN")[0];
  if (x.style.display == "none") {
    x.style.display = "block";
    y.style.transform = "rotate(45deg)";
  } else {
    x.style.display = "none";
    y.style.transform = "rotate(90deg)";
  }
}

function displayCol() {
  var eventType = document.myForm.eventType.value;
  var eventColor = "";
  switch (eventType) {
    case "Event":
      eventColor = "rgba(156, 202, 235, 1)";
      break;
    case "Leisure":
      eventColor = "rgba(247, 167, 0, 1)";
      break;
    case "Family Time":
      eventColor = "rgba(249, 233, 0, 1)";
      break;
    default:
      eventColor = "rgba(153, 198, 109, 1)";
  }
  $("#eventColor").css("background", eventColor);
}

function myFunc() {
  var today = moment();
  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    if (this.el.innerHTML != "") {
      this.el.innerHTML = "";
      this.draw();
    } else {
      this.draw();
    }

    var current = document.querySelector(".today");

    if (current) {
      var self = this;
      window.setTimeout(function() {
        self.openDay(current);
      }, 500);
    }
  }

  Calendar.prototype.draw = function() {
    //Create Header
    this.drawHeader();

    //Draw Month
    this.drawMonth();
    this.drawButton();
    this.drawLegend();
  };

  Calendar.prototype.drawHeader = function() {
    var self = this;
    if (!this.header) {
      //Create the header elements
      this.header = createElement("div", "header");
      this.header.className = "header";
      this.title = createElement("h1");
      var right = createElement("div", "right");
      right.addEventListener("click", function() {
        self.nextMonth();
      });

      var left = createElement("div", "left");
      left.addEventListener("click", function() {
        self.prevMonth();
      });

      //Append the Elements
      this.header.appendChild(this.title);
      this.header.appendChild(right);
      this.header.appendChild(left);
      this.el.appendChild(this.header);
    }

    this.title.innerHTML = this.current.format("MMMM YYYY");
  };

  Calendar.prototype.drawMonth = function() {
    var self = this;
    this.events.forEach(function(ev) {
      ev.date = moment(ev.date, "YYYY-MM-DD");
    });

    if (this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = "month out " + (self.next ? "next" : "prev");
      this.oldMonth.addEventListener("webkitAnimationEnd", function() {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
        self.month = createElement("div", "month");
        self.backFill();
        self.currentMonth();
        self.fowardFill();
        self.el.appendChild(self.month);
        window.setTimeout(function() {
          self.month.className = "month in " + (self.next ? "next" : "prev");
        }, 16);
      });
    } else {
      this.month = createElement("div", "month");
      this.el.appendChild(this.month);
      this.backFill();
      this.currentMonth();
      this.fowardFill();
      this.month.className = "month new";
    }
  };

  Calendar.prototype.backFill = function() {
    var clone = this.current.clone();
    var dayOfWeek = clone.day();
    if (!dayOfWeek) {
      return;
    }

    clone.subtract(dayOfWeek + 1, "days");
    for (var i = dayOfWeek; i > 0; i--) {
      this.drawDay(clone.add(1, "days"));
    }
  };

  Calendar.prototype.fowardFill = function() {
    var clone = this.current
      .clone()
      .add(1, "months")
      .subtract(1, "days");
    var dayOfWeek = clone.day();

    if (dayOfWeek === 6) {
      return;
    }

    for (var i = dayOfWeek; i < 6; i++) {
      this.drawDay(clone.add(1, "days"));
    }
  };

  Calendar.prototype.currentMonth = function() {
    var clone = this.current.clone();
    while (clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add(1, "days");
    }
  };

  Calendar.prototype.getWeek = function(day) {
    if (!this.week || day.day() === 0) {
      this.week = createElement("div", "week");
      this.month.appendChild(this.week);
    }
  };

  Calendar.prototype.drawDay = function(day) {
    var self = this;
    this.getWeek(day);

    //Outer Day
    var outer = createElement("div", this.getDayClass(day));

    if (outer.className.indexOf("other") == -1) {
      outer.addEventListener("click", function() {
        self.openDay(this);
      });
    }

    //Day Name
    var name = createElement("div", "day-name", day.format("ddd"));

    //Day Number
    var number = createElement("div", "day-number", day.format("DD"));

    //Events
    var events = createElement("div", "day-events");

    this.drawEvents(day, events);
    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
    this.week.appendChild(outer);
  };

  Calendar.prototype.drawEvents = function(day, element) {
    if (day.month() === this.current.month()) {
      var todaysEvents = this.events.reduce(function(memo, ev) {
        if (ev.date.isSame(day, "day")) {
          memo.push(ev);
        }
        return memo;
      }, []);

      todaysEvents.forEach(function(ev) {
        var evSpan = createElement("span", ev.color);
        element.appendChild(evSpan);
      });
    }
  };

  Calendar.prototype.getDayClass = function(day) {
    classes = ["day"];
    if (day.month() !== this.current.month()) {
      classes.push("other");
    } else if (today.isSame(day, "day")) {
      classes.push("today");
    }

    return classes.join(" ");
  };

  Calendar.prototype.openDay = function(el) {
    var details, arrow;
    var dayNumber =
      +el.querySelectorAll(".day-number")[0].innerText ||
      +el.querySelectorAll(".day-number")[0].textContent;
    var day = this.current.clone().date(dayNumber);
    var currentOpened = document.querySelector(".details");

    //Check to see if there is an open detais box on the current row
    // if (currentOpened && currentOpened.parentNode === el.parentNode) {
    //   details = currentOpened;
    //   arrow = document.querySelector(".arrow");
    // } else {
      //Close the open events on differnt week row
      //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
      if (currentOpened) {
        currentOpened.addEventListener("webkitAnimationEnd", function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });

        currentOpened.addEventListener("oanimationend", function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });

        currentOpened.addEventListener("msAnimationEnd", function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });

        currentOpened.addEventListener("animationend", function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });

        currentOpened.className = "details out";
      }

      //Create the Details Container
      details = createElement("div", "details in");

      var group1 = createElement("div", "detailsHeader");
      var todayDate = createElement("div", "todayDate", el.innerText);
      //Create the arrow
      //                            var arrow = createElement('div', 'arrow');

      //Create the event wrapper
      //                            details.appendChild(arrow);
      group1.appendChild(todayDate);
      details.appendChild(group1);
      el.parentNode.parentNode.insertBefore(
        details,
        el.parentNode.parentNode.childNodes[0]
      );
    // }

    var todaysEvents = this.events.reduce(function(memo, ev) {
      if (ev.date.isSame(day, "day")) {
        memo.push(ev);
      }

      return memo;
    }, []);

    this.renderEvents(todaysEvents, details);

    // arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + "px";
  };

  Calendar.prototype.renderEvents = function(events, ele) {
    //Remove any events in the current details element
    var currentWrapper = ele.querySelector(".events");
    var wrapper = createElement(
      "div",
      "events in" + (currentWrapper ? " new" : "")
    );

    events.forEach(function(ev) {
      var div = createElement("div", "event");
      var group1 = createElement("div", "eventgrp");
      var group2 = createElement("div", "eventgrp");
      var square = createElement("div", "event-category " + ev.color);
      var span = createElement("span", "", ev.eventName);
      var del = createElement("button", "delBTN", "x");
      group1.appendChild(square);
      group1.appendChild(span);
      group2.appendChild(del);
      div.appendChild(group1);
      div.appendChild(group2);
      del.addEventListener("click", function() {
        delEvent(ev);
      });
      wrapper.appendChild(div);
    });

    if (!events.length) {
      var div = createElement("div", "event empty");
      var span = createElement("span", "", "No Events");
      div.appendChild(span);
      wrapper.appendChild(div);
    }

    if (currentWrapper) {
      currentWrapper.className = "events out";
      currentWrapper.addEventListener("webkitAnimationEnd", function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });

      currentWrapper.addEventListener("oanimationend", function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });

      currentWrapper.addEventListener("msAnimationEnd", function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });

      currentWrapper.addEventListener("animationend", function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
    } else {
      ele.appendChild(wrapper);
    }
  };

  Calendar.prototype.drawLegend = function() {
    var legend = createElement("div", "legend");
    var calendars = this.events
      .map(function(e) {
        return e.calendar + "|" + e.color;
      })
      .reduce(function(memo, e) {
        if (memo.indexOf(e) === -1) {
          memo.push(e);
        }
        return memo;
      }, [])
      .forEach(function(e) {
        var parts = e.split("|");
        var entry = createElement("span", "entry " + parts[1], parts[0]);
        legend.appendChild(entry);
      });
    var legendDOM = document.getElementsByClassName("legend");
    if (legendDOM.length != 0) {
      this.el.replaceChild(legend, legendDOM[0]);
    } else {
      this.el.appendChild(legend);
    }
  };

  Calendar.prototype.drawButton = function() {
    var addBTN = document.querySelector(".addBTN");
    if (addBTN == null) {
      addBTN = createElement("div", "addBTN");
      addBTN.addEventListener("click", function() {
        toggleForm();
      });
    }
    this.el.appendChild(addBTN);
  };

  Calendar.prototype.nextMonth = function() {
    this.current.add(1, "months");
    this.next = true;

    this.draw();
    closeForm();

    var self = this;
    window.setTimeout(function() {
      var today = document.querySelector(".today");
      var first = document.querySelector(".day:not(.other)");
      if (today) {
        window.setTimeout(function() {
          self.openDay(today);
        }, 500);
      } else {
        window.setTimeout(function() {
          self.openDay(first);
        }, 500);
      }
    }, 500);
  };

  Calendar.prototype.prevMonth = function() {
    this.current.subtract(1, "months");
    this.next = false;

    this.draw();
    closeForm();
    var self = this;
    window.setTimeout(function() {
      var today = document.querySelector(".today");
      var first = document.querySelector(".day:not(.other)");
      if (today) {
        window.setTimeout(function() {
          self.openDay(today);
        }, 500);
      } else {
        window.setTimeout(function() {
          self.openDay(first);
        }, 500);
      }
    }, 500);
  };

  window.Calendar = Calendar;

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName);
    if (className) {
      ele.className = className;
    }

    if (innerText) {
      ele.innderText = ele.textContent = innerText;
    }
 
    return ele;
  }
  
  var eventName = document.myForm.eventName.value;
  var eventType = document.myForm.eventType.value;
  var eventColor = "";
  var eventDate = document.myForm.eventDate.value;

  switch (eventType) {
    case "Event":
      eventColor = "blue";
      break;
    case "Leisure":
      eventColor = "orange";
      break;
    case "Family Time":
      eventColor = "yellow";
      break;
    default:
      eventColor = "green";
  }
  var data = JSON.parse(localStorage.getItem("data"));

  if (data == null) data = [];

  if (eventName != "" && eventType != "" && eventColor != "" && eventDate != "")
    data.push({
      eventName: eventName,
      calendar: eventType,
      color: eventColor,
      date: eventDate
    });
  for (var a of data) {
    console.log(a);
  }
  localStorage.setItem("data", JSON.stringify(data));

  /*var data = [
          {eventName: 'Lunch Meeting 1', calendar: 'Home', color: 'blue', date: '2019-06-25'}
        ];*/

  function delEvent(events) {
    var a = data.indexOf(events);
    var b = confirm(
      "Confirm to remove event with information: \nTitle: " +
        events.eventName +
        "\nType: " +
        events.calendar +
        "\nDate: " +
        events.date._i +
        "?"
    );
    if (b) {
      var c = data.splice(a, 1);
      /*for(var z in data)
                          console.log(z);*/
localStorage.setItem("data", JSON.stringify(data));
      
  for (var a of data) {
    console.log(a);
  }
      var calendar = new Calendar("#calendar", data);
      if (c) {
        alert("Event deleted successfully");
      } else {
        alert("Failed to delete event");
      }
    } else {
      //alert("Cancelled deletion");
    }
  }

  var calendar = new Calendar("#calendar", data);

  document.myForm.eventName.value = "";
  document.myForm.eventType.value = "";
  document.myForm.eventDate.value = "";

  toggleForm();
}
