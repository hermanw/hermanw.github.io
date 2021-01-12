const glslSource = `#version 450
#extension GL_EXT_shader_explicit_arithmetic_types_int8 : require
#extension GL_EXT_shader_8bit_storage : require
layout(local_size_x_id = 0, local_size_y_id = 1, local_size_z_id = 2) in;

struct _4
{
    uint _m0[4];
};

struct _11
{
    uint8_t _m0[11];
};


layout(set = 0, binding = 0, std430) buffer _6_30
{
    _4 _m0[];
} _30;

layout(set = 0, binding = 1, std430) buffer _13_31
{
    _11 _m0[];
} _31;

layout(set = 0, binding = 2, std430) buffer _16_32
{
    uint8_t _m0[];
} _32;

layout(set = 0, binding = 3, std430) buffer _19_33
{
    uint _m0[];
} _33;

uvec3 _29 = gl_WorkGroupSize;

uint _929;

void main()
{
    if (_33._m0[1u] < _33._m0[0u])
    {
        uint _54 = gl_GlobalInvocationID.x << 2u;
        uint _57 = gl_GlobalInvocationID.y << 2u;
        uint _59 = _33._m0[2u];
        uint _63 = _33._m0[3u];
        uint _66 = _33._m0[4u];
        uint8_t _70 = _32._m0[_54];
        uint _71 = _54 | 1u;
        uint8_t _73 = _32._m0[_71];
        uint _74 = _54 | 2u;
        uint8_t _76 = _32._m0[_74];
        uint _77 = _54 | 3u;
        uint8_t _79 = _32._m0[_77];
        uint8_t _81 = _32._m0[_57];
        uint _82 = _57 | 1u;
        uint8_t _84 = _32._m0[_82];
        uint _85 = _57 | 2u;
        uint8_t _87 = _32._m0[_85];
        uint _88 = _57 | 3u;
        uint8_t _90 = _32._m0[_88];
        uint _106 = ((((_63 << 8u) & 65280u) | (_59 & 255u)) | ((_66 << 16u) & 16711680u)) | (uint(_70) << 24u);
        uint _116 = (((uint(_76) << 8u) | uint(_73)) | (uint(_79) << 16u)) | (uint(_81) << 24u);
        uint _125 = (((uint(_87) << 8u) | uint(_84)) | (uint(_90) << 16u)) | 2147483648u;
        uint _127 = _106 + 3614090359u;
        uint _132 = (_127 >> 25u) | (_127 << 7u);
        uint _134 = _132 + 4023233417u;
        uint _141 = (_116 + 4177136588u) + ((_134 & 2004318071u) ^ 2562383102u);
        uint _147 = ((_141 >> 20u) | (_141 << 12u)) + _134;
        uint _153 = (_125 + 3168488921u) + ((_147 & (_134 ^ 4023233417u)) ^ 4023233417u);
        uint _159 = ((_153 >> 15u) | (_153 << 17u)) + _147;
        uint _164 = ((_159 & (_147 ^ _134)) ^ _134) + 2978708087u;
        uint _170 = ((_164 >> 10u) | (_164 << 22u)) + _159;
        uint _176 = (_132 + 3846814520u) + ((_170 & (_159 ^ _147)) ^ _147);
        uint _180 = ((_176 >> 25u) | (_176 << 7u)) + _170;
        uint _186 = (_147 + 1200080426u) + ((_180 & (_170 ^ _159)) ^ _159);
        uint _190 = ((_186 >> 20u) | (_186 << 12u)) + _180;
        uint _196 = (_159 + 2821735955u) + ((_190 & (_180 ^ _170)) ^ _170);
        uint _200 = ((_196 >> 15u) | (_196 << 17u)) + _190;
        uint _206 = (_170 + 4249261313u) + ((_200 & (_190 ^ _180)) ^ _180);
        uint _210 = ((_206 >> 10u) | (_206 << 22u)) + _200;
        uint _216 = (_180 + 1770035416u) + ((_210 & (_200 ^ _190)) ^ _190);
        uint _220 = ((_216 >> 25u) | (_216 << 7u)) + _210;
        uint _226 = (_190 + 2336552879u) + ((_220 & (_210 ^ _200)) ^ _200);
        uint _230 = ((_226 >> 20u) | (_226 << 12u)) + _220;
        uint _236 = (_200 + 4294925233u) + ((_230 & (_220 ^ _210)) ^ _210);
        uint _240 = ((_236 >> 15u) | (_236 << 17u)) + _230;
        uint _246 = (_210 + 2304563134u) + ((_240 & (_230 ^ _220)) ^ _220);
        uint _250 = ((_246 >> 10u) | (_246 << 22u)) + _240;
        uint _256 = (_220 + 1804603682u) + ((_250 & (_240 ^ _230)) ^ _230);
        uint _260 = ((_256 >> 25u) | (_256 << 7u)) + _250;
        uint _266 = (_230 + 4254626195u) + ((_260 & (_250 ^ _240)) ^ _240);
        uint _270 = ((_266 >> 20u) | (_266 << 12u)) + _260;
        uint _276 = (_240 + 2792965094u) + ((_270 & (_260 ^ _250)) ^ _250);
        uint _280 = ((_276 >> 15u) | (_276 << 17u)) + _270;
        uint _286 = (_250 + 1236535329u) + ((_280 & (_270 ^ _260)) ^ _260);
        uint _290 = ((_286 >> 10u) | (_286 << 22u)) + _280;
        uint _297 = ((_116 + 4129170786u) + _260) + (((_290 ^ _280) & _270) ^ _280);
        uint _303 = ((_297 >> 27u) | (_297 << 5u)) + _290;
        uint _309 = (_270 + 3225465664u) + (((_303 ^ _290) & _280) ^ _290);
        uint _315 = ((_309 >> 23u) | (_309 << 9u)) + _303;
        uint _321 = (_280 + 643717713u) + (((_315 ^ _303) & _290) ^ _303);
        uint _327 = ((_321 >> 18u) | (_321 << 14u)) + _315;
        uint _334 = ((_106 + 3921069994u) + _290) + (((_327 ^ _315) & _303) ^ _315);
        uint _338 = ((_334 >> 12u) | (_334 << 20u)) + _327;
        uint _344 = (_303 + 3593408605u) + (((_338 ^ _327) & _315) ^ _327);
        uint _348 = ((_344 >> 27u) | (_344 << 5u)) + _338;
        uint _354 = (_315 + 38016083u) + (((_348 ^ _338) & _327) ^ _338);
        uint _358 = ((_354 >> 23u) | (_354 << 9u)) + _348;
        uint _364 = (_327 + 3634488961u) + (((_358 ^ _348) & _338) ^ _348);
        uint _368 = ((_364 >> 18u) | (_364 << 14u)) + _358;
        uint _374 = (_338 + 3889429448u) + (((_368 ^ _358) & _348) ^ _358);
        uint _378 = ((_374 >> 12u) | (_374 << 20u)) + _368;
        uint _384 = (_348 + 568446438u) + (((_378 ^ _368) & _358) ^ _368);
        uint _388 = ((_384 >> 27u) | (_384 << 5u)) + _378;
        uint _394 = (_358 + 3275163694u) + (((_388 ^ _378) & _368) ^ _378);
        uint _398 = ((_394 >> 23u) | (_394 << 9u)) + _388;
        uint _404 = (_368 + 4107603335u) + (((_398 ^ _388) & _378) ^ _388);
        uint _408 = ((_404 >> 18u) | (_404 << 14u)) + _398;
        uint _414 = (_378 + 1163531501u) + (((_408 ^ _398) & _388) ^ _398);
        uint _418 = ((_414 >> 12u) | (_414 << 20u)) + _408;
        uint _424 = (_388 + 2850285829u) + (((_418 ^ _408) & _398) ^ _408);
        uint _428 = ((_424 >> 27u) | (_424 << 5u)) + _418;
        uint _435 = ((_125 + 4243563512u) + _398) + (((_428 ^ _418) & _408) ^ _418);
        uint _439 = ((_435 >> 23u) | (_435 << 9u)) + _428;
        uint _445 = (_408 + 1735328473u) + (((_439 ^ _428) & _418) ^ _428);
        uint _449 = ((_445 >> 18u) | (_445 << 14u)) + _439;
        uint _450 = _449 ^ _439;
        uint _455 = (_418 + 2368359562u) + ((_450 & _428) ^ _439);
        uint _459 = ((_455 >> 12u) | (_455 << 20u)) + _449;
        uint _463 = (_428 + 4294588738u) + (_450 ^ _459);
        uint _468 = ((_463 >> 28u) | (_463 << 4u)) + _459;
        uint _473 = (_439 + 2272392833u) + ((_459 ^ _449) ^ _468);
        uint _478 = ((_473 >> 21u) | (_473 << 11u)) + _468;
        uint _483 = (_449 + 1839030562u) + ((_468 ^ _459) ^ _478);
        uint _487 = ((_483 >> 16u) | (_483 << 16u)) + _478;
        uint _492 = (_459 + 4259657828u) + ((_478 ^ _468) ^ _487);
        uint _496 = ((_492 >> 9u) | (_492 << 23u)) + _487;
        uint _502 = ((_116 + 2763975236u) + _468) + ((_487 ^ _478) ^ _496);
        uint _506 = ((_502 >> 28u) | (_502 << 4u)) + _496;
        uint _511 = (_478 + 1272893353u) + ((_496 ^ _487) ^ _506);
        uint _515 = ((_511 >> 21u) | (_511 << 11u)) + _506;
        uint _520 = (_487 + 4139469664u) + ((_506 ^ _496) ^ _515);
        uint _524 = ((_520 >> 16u) | (_520 << 16u)) + _515;
        uint _529 = (_496 + 3200236656u) + ((_515 ^ _506) ^ _524);
        uint _533 = ((_529 >> 9u) | (_529 << 23u)) + _524;
        uint _538 = (_506 + 681279174u) + ((_524 ^ _515) ^ _533);
        uint _542 = ((_538 >> 28u) | (_538 << 4u)) + _533;
        uint _548 = ((_106 + 3936430074u) + _515) + ((_533 ^ _524) ^ _542);
        uint _552 = ((_548 >> 21u) | (_548 << 11u)) + _542;
        uint _557 = (_524 + 3572445317u) + ((_542 ^ _533) ^ _552);
        uint _561 = ((_557 >> 16u) | (_557 << 16u)) + _552;
        uint _566 = (_533 + 76029189u) + ((_552 ^ _542) ^ _561);
        uint _570 = ((_566 >> 9u) | (_566 << 23u)) + _561;
        uint _575 = (_542 + 3654602809u) + ((_561 ^ _552) ^ _570);
        uint _579 = ((_575 >> 28u) | (_575 << 4u)) + _570;
        uint _584 = (_552 + 3873151461u) + ((_570 ^ _561) ^ _579);
        uint _588 = ((_584 >> 21u) | (_584 << 11u)) + _579;
        uint _593 = (_561 + 530742520u) + ((_579 ^ _570) ^ _588);
        uint _597 = ((_593 >> 16u) | (_593 << 16u)) + _588;
        uint _603 = ((_125 + 3299628645u) + _570) + ((_588 ^ _579) ^ _597);
        uint _607 = ((_603 >> 9u) | (_603 << 23u)) + _597;
        uint _615 = ((_106 + 4096336452u) + _579) + ((_607 | (_588 ^ 4294967295u)) ^ _597);
        uint _621 = ((_615 >> 26u) | (_615 << 6u)) + _607;
        uint _627 = (_588 + 1126891415u) + ((_621 | (_597 ^ 4294967295u)) ^ _607);
        uint _631 = ((_627 >> 22u) | (_627 << 10u)) + _621;
        uint _637 = (_597 + 2878612479u) + ((_631 | (_607 ^ 4294967295u)) ^ _621);
        uint _641 = ((_637 >> 17u) | (_637 << 15u)) + _631;
        uint _647 = (_607 + 4237533241u) + ((_641 | (_621 ^ 4294967295u)) ^ _631);
        uint _651 = ((_647 >> 11u) | (_647 << 21u)) + _641;
        uint _657 = (_621 + 1700485571u) + ((_651 | (_631 ^ 4294967295u)) ^ _641);
        uint _661 = ((_657 >> 26u) | (_657 << 6u)) + _651;
        uint _667 = (_631 + 2399980690u) + ((_661 | (_641 ^ 4294967295u)) ^ _651);
        uint _671 = ((_667 >> 22u) | (_667 << 10u)) + _661;
        uint _677 = (_641 + 4293915773u) + ((_671 | (_651 ^ 4294967295u)) ^ _661);
        uint _681 = ((_677 >> 17u) | (_677 << 15u)) + _671;
        uint _688 = ((_116 + 2240044497u) + _651) + ((_681 | (_661 ^ 4294967295u)) ^ _671);
        uint _692 = ((_688 >> 11u) | (_688 << 21u)) + _681;
        uint _698 = (_661 + 1873313359u) + ((_692 | (_671 ^ 4294967295u)) ^ _681);
        uint _702 = ((_698 >> 26u) | (_698 << 6u)) + _692;
        uint _708 = (_671 + 4264355552u) + ((_702 | (_681 ^ 4294967295u)) ^ _692);
        uint _712 = ((_708 >> 22u) | (_708 << 10u)) + _702;
        uint _718 = (_681 + 2734768916u) + ((_712 | (_692 ^ 4294967295u)) ^ _702);
        uint _722 = ((_718 >> 17u) | (_718 << 15u)) + _712;
        uint _728 = (_692 + 1309151649u) + ((_722 | (_702 ^ 4294967295u)) ^ _712);
        uint _732 = ((_728 >> 11u) | (_728 << 21u)) + _722;
        uint _738 = (_702 + 4149444226u) + ((_732 | (_712 ^ 4294967295u)) ^ _722);
        uint _742 = ((_738 >> 26u) | (_738 << 6u)) + _732;
        uint _748 = (_712 + 3174756917u) + ((_742 | (_722 ^ 4294967295u)) ^ _732);
        uint _752 = ((_748 >> 22u) | (_748 << 10u)) + _742;
        uint _759 = ((_125 + 718787259u) + _722) + ((_752 | (_732 ^ 4294967295u)) ^ _742);
        uint _763 = ((_759 >> 17u) | (_759 << 15u)) + _752;
        uint _769 = (_732 + 3951481745u) + ((_763 | (_742 ^ 4294967295u)) ^ _752);
        uint _774 = _742 + 1732584193u;
        uint _776 = (_763 + 4023233417u) + ((_769 >> 11u) | (_769 << 21u));
        uint _777 = _763 + 2562383102u;
        uint _779 = _752 + 271733878u;
        if (!(int(_33._m0[0u]) < int(1u)))
        {
            uint _785 = _33._m0[0u] + 4294967295u;
            uint _877;
            bool _878;
            bool _879;
            bool _880;
            uint _887;
            uint _888;
            bool _895;
            uint _788 = 0u;
            uint _789 = _785;
            uint _790;
            uint _791;
            uint _793;
            for (;;)
            {
                _790 = _788 + _789;
                _791 = uint(int(_790) / int(2u));
                _793 = _30._m0[_791]._m0[0u];
                if (!(_793 < _774))
                {
                    bool _863;
                    bool _864;
                    bool _865;
                    if (!(_793 > _774))
                    {
                        bool _858;
                        bool _859;
                        bool _860;
                        if (!(_30._m0[_791]._m0[1u] < _776))
                        {
                            bool _853;
                            bool _854;
                            bool _855;
                            if (!(_30._m0[_791]._m0[1u] > _776))
                            {
                                bool _848;
                                bool _849;
                                bool _850;
                                if (!(_30._m0[_791]._m0[2u] < _777))
                                {
                                    bool _843;
                                    bool _844;
                                    bool _845;
                                    if (!(_30._m0[_791]._m0[2u] > _777))
                                    {
                                        bool _838;
                                        bool _839;
                                        bool _840;
                                        if (!(_30._m0[_791]._m0[3u] < _779))
                                        {
                                            _838 = true;
                                            _839 = false;
                                            _840 = _30._m0[_791]._m0[3u] > _779;
                                        }
                                        else
                                        {
                                            _838 = false;
                                            _839 = true;
                                            _840 = false;
                                        }
                                        _843 = _838;
                                        _844 = _839;
                                        _845 = _840;
                                    }
                                    else
                                    {
                                        _843 = false;
                                        _844 = false;
                                        _845 = true;
                                    }
                                    _848 = _843;
                                    _849 = _844;
                                    _850 = _845;
                                }
                                else
                                {
                                    _848 = false;
                                    _849 = true;
                                    _850 = false;
                                }
                                _853 = _848;
                                _854 = _849;
                                _855 = _850;
                            }
                            else
                            {
                                _853 = false;
                                _854 = false;
                                _855 = true;
                            }
                            _858 = _853;
                            _859 = _854;
                            _860 = _855;
                        }
                        else
                        {
                            _858 = false;
                            _859 = true;
                            _860 = false;
                        }
                        _863 = _858;
                        _864 = _859;
                        _865 = _860;
                    }
                    else
                    {
                        _863 = false;
                        _864 = false;
                        _865 = true;
                    }
                    uint _872;
                    bool _873;
                    bool _874;
                    if (_865)
                    {
                        _872 = _791 + 4294967295u;
                        _873 = false;
                        _874 = true;
                    }
                    else
                    {
                        _872 = _929;
                        _873 = _863;
                        _874 = false;
                    }
                    _877 = _872;
                    _878 = _873;
                    _879 = _874;
                    _880 = _864;
                    bool _889;
                    if (_880)
                    {
                        uint _884 = _791 + 1u;
                        _887 = _884;
                        _888 = _789;
                        _889 = true;
                    }
                    else
                    {
                        _887 = _788;
                        _888 = _877;
                        _889 = _879;
                    }
                    if (_889)
                    {
                        bool _892 = int(_887) > int(_888);
                        _895 = _892;
                        if (_895)
                        {
                            break;
                        }
                        else
                        {
                            _788 = _887;
                            _789 = _888;
                            continue;
                        }
                    }
                    else
                    {
                        _895 = true;
                        if (_895)
                        {
                            break;
                        }
                        else
                        {
                            _788 = _887;
                            _789 = _888;
                            continue;
                        }
                    }
                }
                else
                {
                    _877 = _929;
                    _878 = false;
                    _879 = false;
                    _880 = true;
                    bool _889;
                    if (_880)
                    {
                        uint _884 = _791 + 1u;
                        _887 = _884;
                        _888 = _789;
                        _889 = true;
                    }
                    else
                    {
                        _887 = _788;
                        _888 = _877;
                        _889 = _879;
                    }
                    if (_889)
                    {
                        bool _892 = int(_887) > int(_888);
                        _895 = _892;
                        if (_895)
                        {
                            break;
                        }
                        else
                        {
                            _788 = _887;
                            _789 = _888;
                            continue;
                        }
                    }
                    else
                    {
                        _895 = true;
                        if (_895)
                        {
                            break;
                        }
                        else
                        {
                            _788 = _887;
                            _789 = _888;
                            continue;
                        }
                    }
                }
            }
            if (_878)
            {
                if (int(_790) > int(4294967294u))
                {
                    uint _907 = atomicAdd(_33._m0[1u], 1u);
                    _31._m0[_791]._m0[0u] = uint8_t(_59);
                    _31._m0[_791]._m0[1u] = uint8_t(_63);
                    _31._m0[_791]._m0[2u] = uint8_t(_66);
                    _31._m0[_791]._m0[3u] = _70;
                    _31._m0[_791]._m0[4u] = _73;
                    _31._m0[_791]._m0[5u] = _76;
                    _31._m0[_791]._m0[6u] = _79;
                    _31._m0[_791]._m0[7u] = _81;
                    _31._m0[_791]._m0[8u] = _84;
                    _31._m0[_791]._m0[9u] = _87;
                    _31._m0[_791]._m0[10u] = _90;
                }
            }
        }
    }
}
`;