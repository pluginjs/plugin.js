import { parseHTML } from '@pluginjs/dom'

export default () => parseHTML`
<div class="wizard">
  <ul class="pj-wizard-steps" role="tablist">
    <li class="active" role="tab">
      Step 1
    </li>
    <li role="tab">
      Step 2
    </li>
    <li role="tab">
      Step 3
    </li>
  </ul>
  <div class="pj-wizard-content">
    <div class="pj-wizard-pane active" role="tabpanel">Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</div>
    <div class="pj-wizard-pane" role="tabpanel">Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid. Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero sint qui sapiente accusamus tattooed echo park.</div>
    <div class="pj-wizard-pane" role="tabpanel">Etsy mixtape wayfarers, ethical wes anderson tofu before they sold out mcsweeney's organic lomo retro fanny pack lo-fi farm-to-table readymade. Messenger bag gentrify pitchfork tattooed craft beer, iphone skateboard locavore carles etsy salvia banksy hoodie helvetica. DIY synth PBR banksy irony. Leggings gentrify squid 8-bit cred pitchfork. Williamsburg banh mi whatever gluten-free, carles pitchfork biodiesel fixie etsy retro mlkshk vice blog. Scenester cred you probably haven't heard of them, vinyl craft beer blog stumptown. Pitchfork sustainable tofu synth chambray yr.</div>
  </div>
  <div class="pj-wizard-buttons">
    <a class="pj-wizard-default" data-wizard="back">Previous</a>
    <a class="pj-wizard-primary" data-wizard="next">Next</a>
    <a class="pj-wizard-success" data-wizard="finish">Finish</a>
  </div>
</div>
`
