var _ = require('lodash');
var fs = require('fs');

var SendGrid = require('sendgrid');
var Request = require('sendgrid-rest').request;

var apikey = process.env.SENDGRID_API_KEY;
var sg = SendGrid.SendGrid(apikey);

var templates = {
  greeting: "0297b1a6-d052-42d5-a996-0585fbddf8fc",
  prospect: "064e3479-ebcb-4579-baa3-14e0f551c414",
};


var g_content = {};
function readContent(content) {
  if (!(content in g_content)) {
    g_content[content] = {
      text: fs.readFileSync("./templates/email/"+content+".txt", "utf-8"),
      html: fs.readFileSync("./templates/email/"+content+".html", "utf-8")
    };
  }
  return g_content[content];
}


function generateMsg(email) {
  var helper = require('sendgrid').mail;
  var mail = new helper.Mail();
  var personalization = new helper.Personalization();

  var content = {  // Fault of the API -- apparently template isn't enough
    text: "1",
    html: "1"
  };
  if ("content" in email) {
    if ("text" in email.content) {
      content.text = email.content.text;
    }
    if ("html" in email.content) {
      content.html = email.content.html;
    }
  }
  if (content.text !== "1") {
    var text_content = new helper.Content("text/plain", content.text);
    mail.addContent(text_content);
  }
  var html_content = new helper.Content("text/html", content.html);
  mail.addContent(html_content);

  var fr;
  if (("from" in email) && email.from) {
    fr = new helper.Email(email.from.email, email.from.name);
  } else {
    fr = new helper.Email("mailer@no-reply.larson.agency", "The Larson Agency");
  }
  mail.setFrom(fr);

  if (("tmpl" in email) && email.tmpl)
    mail.setTemplateId(email.tmpl);

  if (("sline" in email) && email.sline)
    mail.setSubject(email.sline);

  if (("recips" in email) && email.recips) {
    for (var i=0; i < email.recips.length; i++) {
      var recip = email.recips[i];

      if (("bcc" in recip) && recip.bcc) {
        personalization.addBcc(new helper.Email(recip.bcc));
      }

      if (("email" in recip) && recip.email) {
        var name = "";
        if (("first" in recip) && recip.first) {
          name = recip.first;
        }
        if (("last" in recip) && recip.last) {
          name += " "+recip.last;
        }

        if (name !== "") {
          personalization.addTo(new helper.Email(recip.email, name));
        } else {
          personalization.addTo(new helper.Email(recip.email));
        }
      }
    }
  }

  if (("substitutions" in email) && email.substitutions) {
    for (var sub in email.substitutions) {
      personalization.addSubstitution(new helper.Substitution(sub, email.substitutions[sub]));
    }
  }

  mail.addPersonalization(personalization);

  //console.log(mail.toJSON());

  return mail.toJSON();
}

function send(body) {
  var req = JSON.parse(JSON.stringify(Request));
  req.method = "POST";
  req.path = '/v3/mail/send';
  req.body = body;
  sg.API(req, function(res) {
    if (res.statusCode !== 202) {
      console.log(res.statusCode);
      console.log(res.body);
      console.log(res.headers);
    }
  });
}


module.exports = {
  sg: sg,
  generateMsg: generateMsg,

  greeting: function (recip, first, last) {
    var email = {
      content: {},
      tmpl: templates.greeting,
      recips: [
        {
          email: recip,
          first: first,
          last: last,
        }
      ],
      substitutions: {
        '%email%': recip,
        '%first%': first,
        '%last%': last,
      },
    };

    send(generateMsg(email));
  },

  prospect: function (recip, first, last, msg) {
    var email = {
      content: {},
      tmpl: templates.prospect,
      recips: [
        { email: "info@larson.agency" },
        { bcc: "bobby@larson.agency" },
      ],
      from: {
        email: recip,
        first: first,
        last: last,
      },
      substitutions: {
        '%email%': recip,
        '%first%': first,
        '%last%': last,
        '%idea%': msg
      },
    };

    send(generateMsg(email));
  },

};
